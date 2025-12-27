import express from "express";
import { createStream, endStream, getStreams } from "../controllers/stream.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authenticate, createStream);
router.get("/", getStreams);
router.patch("/:id/end", endStream);


export default router;
