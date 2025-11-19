import express from "express";
import { authenticate } from "../middlewares/auth.js";

import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing,
  getUserProfile
} from "../controllers/followers.controller.js";

const router = express.Router();


router.post("/follow", authenticate, followUser);
router.post("/unfollow", authenticate, unfollowUser);


router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);


router.get("/:id/is-following", authenticate, checkFollowing);


router.get("/:id", getUserProfile);

export default router;
