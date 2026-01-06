import { AppDataSource } from "../config/data-source.js";
import { v4 as uuidv4 } from "uuid";
import User from "../entities/User.js";
import Stream from "../entities/Stream.js";

const streamRepo = AppDataSource.getRepository(Stream);
const userRepo = AppDataSource.getRepository(User);

export const createStream = async (req, res) => {
  const { title, category, description, userId, socket_id } = req.body;

  if (!title || !category || !userId) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const active = await streamRepo.findOne({
    where: { user: { id: userId }, is_live: true },
  });

  if (active) {
    return res.status(400).json({
      message: "User already has an active stream",
    });
  }

  const stream = streamRepo.create({
    title,
    category,
    description,
    user,
    stream_key: uuidv4(),
    is_live: true,
    started_at: new Date(),
    socket_id,
  });

  await streamRepo.save(stream);

  return res.status(201).json({
    id: stream.id,
    title: stream.title,
    category: stream.category,
    socket_id: stream.socket_id,
  });
};

export const getStreams = async (req, res) => {
  const streams = await streamRepo.find({
    where: { is_live: true },
    relations: ["user"],
    order: { started_at: "DESC" },
  });

  res.json(streams);
};

export const endStream = async (req, res) => {
  const streamId = Number(req.params.id);

  if (!streamId) {
    return res.status(400).json({ message: "Stream ID is required" });
  }

  const stream = await streamRepo.findOne({
    where: { id: streamId },
  });

  if (!stream) {
    return res.status(404).json({ message: "Stream not found" });
  }

  stream.is_live = false;
  await streamRepo.save(stream);

  return res.json({
    success: true,
    streamId,
  });
};

export const CreateStreamUrl = async (req, res) => {
  const { url } = req.body;
  const { id } = req.params;
  console.log("URL FROM BODY:", url);

  if (!url || !id) {
    return res.status(400).json({
      message: "missing url or streamId",
    });
  }

  const stream = await streamRepo.findOne({
    where: { id: Number(id) },
  });

  if (!stream) {
    return res.status(404).json({
      message: "stream not found",
    });
  }

  stream.Stream_Url = url;
  await streamRepo.save(stream);

  return res.json({
    success: true,
    streamId: id,
    videoUrl: url,
  });
};

export const getStreamUrlByUserId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const streams = await streamRepo.find({
      where: { user: { id: Number(id) } },
      order: { started_at: "DESC" },
    });

    if (!streams.length) {
      return res.status(404).json({
        error: "No streams found for this user",
      });
    }

    return res.json(streams);
  } catch (error) {
    console.error("Error fetching streams:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getStreamById = async (req, res) => {
  const { id } = req.params;

  const stream = await streamRepo.findOne({
    where: { id: Number(id) },
    relations: ["user"],
  });

  if (!stream) {
    return res.status(404).json({ message: "Stream not found" });
  }

  res.json(stream);
};
