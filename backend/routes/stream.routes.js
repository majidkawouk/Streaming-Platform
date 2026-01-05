import express from "express";
import { createStream, CreateStreamUrl, endStream, getStreams, getStreamUrlByUserId } from "../controllers/stream.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authenticate, createStream);
router.get("/", getStreams);
router.patch("/:id/end", endStream);
router.patch("/:id/video-url",CreateStreamUrl)
router.get("/:id/url",getStreamUrlByUserId)

export default router;
