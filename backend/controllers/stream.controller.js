import { AppDataSource } from "../config/data-source.js";
import { v4 as uuidv4 } from "uuid";
import User from "../entities/User.js";
import Stream from "../entities/Stream.js";

const streamRepo = AppDataSource.getRepository(Stream);
    const userRepo = AppDataSource.getRepository(User);

export const createStream = async (req, res) => {
  const { title, category, description, userId } = req.body;
  
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const stream = streamRepo.create({
    title,
    category,
    description,
    user,
    stream_key: uuidv4(),
    is_live: true,
    started_at: new Date(),
  });

  await streamRepo.save(stream);

  res.json(stream);
};

export const getStreams = async (req, res) => {
  const streams = await streamRepo.find({ relations: ["user"] });
  res.json(streams);
};

export const EndStream = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
      const stream = await streamRepo.findOne({
      where: {
        user: { id: userId },
        is_live: true,
      },
      relations: ["user"],
    });

    if (!stream) {
      return res.status(404).json({
        message: "No active stream found for this user",
      });
    }

    await streamRepo.update(
      { id: stream.id },
      {
        is_live: false,
        ended_at: new Date(),
      }
    );

    return res.json({
      message: "Stream ended successfully",
      streamId: stream.id,
      userId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to end stream" });
  }
};
