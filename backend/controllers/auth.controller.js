import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source.js";
import User from "../entities/User.js";
import dotenv from "dotenv";

dotenv.config();
const userRepo = AppDataSource.getRepository(User);


export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already in use" });


    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepo.create({
      username,
      email,
      password: hashedPassword,
    });

    await userRepo.save(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ message: "User registered", token });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userRepo.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await userRepo.findOne({ where: { id: req.user.id } });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
