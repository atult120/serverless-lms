import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";

config(); // Load .env for DB credentials

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: parseInt(process.env.DB_PORT ?? "3306", 10),
  username: process.env.DB_USER ?? "root",
  password: process.env.DB_PASS ?? "",
  database: process.env.DB_NAME ?? "lms",
  synchronize: false,
  logging: true,
  entities: ["src/entities/*.ts"],
  migrations: ["src/migrations/*.ts"],
});
