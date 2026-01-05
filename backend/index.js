import "reflect-metadata";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import * as mediasoup from "mediasoup";
import { AppDataSource } from "./config/data-source.js";
import authRoutes from "./routes/auth.routes.js";
import streamRoutes from "./routes/stream.routes.js";
import followersRoutes from "./routes/followers.routes.js";
import { createClient } from "redis";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  forcePathStyle: true,
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
});

const redisclient = createClient({
  url: "redis://127.0.0.1:6379",
});

redisclient.on("connect", () => {
  console.log("Redis connected successfully");
});

redisclient.on("error", (err) => {
  console.error("Redis error", err);
});

await redisclient.connect();

await redisclient.set("test", "redis is working fine");
console.log(await redisclient.get("test"));

const app = express();
app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .then(() => console.log(" Data Source initialized"))
  .catch((err) => console.error(" Data Source error", err));

app.use("/auth", authRoutes);
app.use("/streams", streamRoutes);
app.use("/followers", followersRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let worker;
let router;
const transports = {};
const producers = {};

async function createWorker() {
  worker = await mediasoup.createWorker();
  worker.on("died", () => {
    console.error(" Mediasoup worker died");
    process.exit(1);
  });

  router = await worker.createRouter({
    mediaCodecs: [
      { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
      {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
          "x-google-start-bitrate": 4000,
          "x-google-max-bitrate": 8000,
          "x-google-min-bitrate": 3000,
        },
      },
    ],
  });

  console.log(" Mediasoup Router created");
}
createWorker();

app.get("/rtpCapabilities", (req, res) => res.json(router.rtpCapabilities));

app.get("/producers", (req, res) => {
  const video = Object.values(producers)
    .filter((p) => p.kind === "video")
    .map((p) => ({
      producerId: p.producer.id,
      socketId: p.socketId,
      name: p.name,
      category: p.category,
    }));

  const audio = Object.values(producers)
    .filter((p) => p.kind === "audio")
    .map((p) => ({
      producerId: p.producer.id,
      socketId: p.socketId,
      name: p.name,
      category: p.category,
    }));

  res.json({ video, audio });
});

io.on("connection", (socket) => {
  console.log(` Client connected: ${socket.id}`);

  socket.on("createTransport", async ({ consuming }, callback) => {
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: "127.0.0.1" }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });
    transports[transport.id] = { transport, socketId: socket.id };

    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });
  });

  socket.on("connectTransport", async ({ dtlsParameters }) => {
    const t = Object.values(transports).find((t) => t.socketId === socket.id);
    if (t) await t.transport.connect({ dtlsParameters });
  });

  socket.on(
    "produce",
    async ({ kind, rtpParameters, name, category }, callback) => {
      const t = Object.values(transports).find((t) => t.socketId === socket.id);
      if (!t) return;

      const producer = await t.transport.produce({ kind, rtpParameters });
      producers[socket.id + "-" + kind] = {
        producer,
        kind,
        socketId: socket.id,
        name,
        category,
      };

      io.emit("new-producer", {
        id: producer.id,
        socketId: socket.id,
        kind,
        name,
        category,
      });

      producer.on(
        "transportclose",
        () => delete producers[socket.id + "-" + kind]
      );

      callback({ id: producer.id });
    }
  );

  socket.on("consume", async ({ producerId, rtpCapabilities }, callback) => {
    try {
      const producerEntry = Object.values(producers).find(
        (p) => p.producer.id === producerId
      );
      if (!producerEntry) return callback({ error: "Producer not found" });

      const t = Object.values(transports).find((t) => t.socketId === socket.id);
      if (!t) return callback({ error: "Transport not found" });

      if (!router.canConsume({ producerId, rtpCapabilities }))
        return callback({ error: "Cannot consume" });

      const consumer = await t.transport.consume({
        producerId,
        rtpCapabilities,
        paused: false,
      });

      callback({
        id: consumer.id,
        producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
    } catch (err) {
      callback({ error: err.message });
    }
  });
  socket.on("joinRoom", async ({ streamerSocketId }) => {
    const room = `stream-${streamerSocketId}`;
    socket.join(room);
    const key = `chat:room:${streamerSocketId}`;
    const history = await redisclient.lRange(key, 0, -1);
    console.log(`Socket ${socket.id} joined ${room}`);
    socket.emit("chat-history", history.map(JSON.parse).reverse());
  });

  socket.on("createroom", ({ streamerSocketId }) => {
    socket.join(`stream-${streamerSocketId}`);
    console.log(`Socket ${socket.id} created stream-${streamerSocketId}`);
  });

  socket.on("chat-message", async ({ streamerSocketId, text, user }) => {
    const message = {
      id: crypto.randomUUID(),
      socketId: socket.id,
      user,
      text,
      time: Date.now(),
    };
    const key = `chat:room:${streamerSocketId}`;
    await redisclient.lPush(key, JSON.stringify(message));
    await redisclient.lTrim(key, 0, 99);

    io.to(`stream-${streamerSocketId}`).emit("chat-message", message);
  });

  socket.on("disconnect", () => {
    console.log(" Disconnected:", socket.id);
    Object.keys(producers).forEach((key) => {
      if (key.startsWith(socket.id)) delete producers[key];
    });
  });
});

app.post("/get-upload-url", async (req, res) => {
  const { fileName, fileType } = req.body;
  const key = `uploads/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: "streams",
    Key: key,
    ContentType: fileType,
  });
  try {
    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });
    const publicUrl = `https://joegyxpfdkixsygujftu.supabase.co/storage/v1/object/public/streams/${key}`;
    res.json({
      uploadUrl,
      publicUrl,
    });
  } catch (err) {
    res.status(500).json({ error: "failed to generate url" });
  }
});
server.listen(3000, () =>
  console.log(" Server running on http://localhost:3000")
);
