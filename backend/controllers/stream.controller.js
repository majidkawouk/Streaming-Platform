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
