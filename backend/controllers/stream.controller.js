import { AppDataSource } from "../config/data-source.js";
import Stream from "../entities/Stream.js";
import { v4 as uuidv4 } from "uuid";

const streamRepo = AppDataSource.getRepository("Stream");

export const createStream = async (req, res) => {
  try {
    const { title, category } = req.body;
    const stream_key = uuidv4();

    const stream = streamRepo.create({
      title,
      category,
      user: { id: req.user.id },
      stream_key,
      is_live: false,
    });

    await streamRepo.save(stream);
    res.json({ message: "Stream created", stream });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStreams = async (req, res) => {
  const streams = await streamRepo.find({ relations: ["user"] });
  res.json(streams);
};
