import "reflect-metadata";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import * as mediasoup from "mediasoup";
import { AppDataSource } from "./config/data-source.js";
import authRoutes from "./routes/auth.routes.js";
import streamRoutes from "./routes/stream.routes.js";


const app = express();
app.use(cors());
app.use(express.json());


AppDataSource.initialize()
  .then(() => console.log(" Data Source initialized"))
  .catch((err) => console.error(" Data Source error", err));

app.use("/auth", authRoutes);
app.use("/streams", streamRoutes);

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
      { kind: "video", mimeType: "video/VP8", clockRate: 90000, parameters: {} },
    ],
  });

  console.log(" Mediasoup Router created");
}
createWorker();


app.get("/rtpCapabilities", (req, res) => res.json(router.rtpCapabilities));

app.get("/producers", (req, res) => {
  const list = Object.values(producers)
    .filter((p) => p.kind === "video")
    .map((p) => ({
      id: p.producer.id,
      socketId: p.socketId,
      name: p.name || "Untitled Stream",
      category: p.category || "Uncategorized",
    }));
  res.json(list);
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

  socket.on("produce", async ({ kind, rtpParameters, name, category }, callback) => {
    const t = Object.values(transports).find((t) => t.socketId === socket.id);
    if (!t) return;

    const producer = await t.transport.produce({ kind, rtpParameters });
    producers[socket.id + "-" + kind] = { producer, kind, socketId: socket.id, name, category };

    io.emit("new-producer", { id: producer.id, socketId: socket.id, kind, name, category });

    producer.on("transportclose", () => delete producers[socket.id + "-" + kind]);

    callback({ id: producer.id });
  });

  socket.on("consume", async ({ producerId, rtpCapabilities }, callback) => {
    try {
      const producerEntry = Object.values(producers).find((p) => p.producer.id === producerId);
      if (!producerEntry) return callback({ error: "Producer not found" });

      const t = Object.values(transports).find((t) => t.socketId === socket.id);
      if (!t) return callback({ error: "Transport not found" });

      if (!router.canConsume({ producerId, rtpCapabilities })) return callback({ error: "Cannot consume" });

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


 socket.on("chat-message", (msg) => {
  socket.broadcast.emit("chat-message", msg);
});



  socket.on("disconnect", () => {
    console.log(" Disconnected:", socket.id);
    Object.keys(producers).forEach((key) => { if (key.startsWith(socket.id)) delete producers[key]; });
  });
});

server.listen(3000, () => console.log(" Server running on http://localhost:3000"));
