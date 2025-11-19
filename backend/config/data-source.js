import { DataSource } from "typeorm";
import dotenv from "dotenv";
import User from "../entities/User.js";
import Stream from "../entities/Stream.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST ,
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_DATABASE ,
  synchronize: true,
  logging: true,
  entities: [User, Stream],
});
