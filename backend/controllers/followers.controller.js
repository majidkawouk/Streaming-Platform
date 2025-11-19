import { AppDataSource } from "../config/data-source.js";
import User from "../entities/User.js";

export const followUser = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const myId = req.user.id;

    if (myId === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userRepo = AppDataSource.getRepository(User);

    const me = await userRepo.findOne({
      where: { id: myId },
      relations: ["following"],
    });

    const target = await userRepo.findOne({
      where: { id: targetUserId },
    });

    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFollowing = me.following.some((u) => u.id === targetUserId);

    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following this user" });
    }

    me.following.push(target);
    await userRepo.save(me);

    return res.json({ message: "Followed successfully" });
  } catch (err) {
    console.log("Follow Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const myId = req.user.id;

    const userRepo = AppDataSource.getRepository(User);
    
    const me = await userRepo.findOne({
      where: { id: myId },
      relations: ["following"],
    });

    me.following = me.following.filter((u) => u.id !== targetUserId);

    await userRepo.save(me);

    return res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.log("Unfollow Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["followers"],
    });

    return res.json(user.followers);
  } catch (err) {
    console.log("Get Followers Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["following"],
    });

    return res.json(user.following);
  } catch (err) {
    console.log("Get Following Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const checkFollowing = async (req, res) => {
  try {
    const profileId = req.params.id;
    const myId = req.user.id;

    const userRepo = AppDataSource.getRepository(User);

    const me = await userRepo.findOne({
      where: { id: myId },
      relations: ["following"],
    });

    const isFollowing = me.following.some((u) => u.id == profileId);

    return res.json({ isFollowing });
  } catch (err) {
    console.log("Check Following Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["followers", "following"],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      followers: user.followers.length,
      following: user.following.length,
      totalViews: 0,
      created_at: user.created_at,
    });
  } catch (err) {
    console.log("Get Profile Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
