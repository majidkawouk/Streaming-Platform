import express from "express";
import { createStream, EndStream, getStreams } from "../controllers/stream.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authenticate, createStream);
router.get("/", getStreams);
router.patch("/",EndStream )

export default router;
