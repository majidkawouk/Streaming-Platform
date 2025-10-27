import express from "express";
import { register, login, getProfile } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();


router.post("/register", register);


router.post("/login", login);


router.get("/profile", authenticate, getProfile);

export default router;
