import express from "express";
import { createStream, getStreams } from "../controllers/stream.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authenticate, createStream);
router.get("/", getStreams);

export default router;
