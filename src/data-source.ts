import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "./entities/User";
import { HowToVideo } from "./entities/HowToVideo";

config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: parseInt(process.env.DB_PORT ?? "3306", 10),
  username: process.env.DB_USER ?? "root",
  password: process.env.DB_PASS ?? "",
  database: process.env.DB_NAME ?? "lms",
  synchronize: false,
  logging: true,
  entities: [User, HowToVideo], 
  migrations: ["src/migrations/*.ts"],
});
