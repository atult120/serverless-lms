import "reflect-metadata";
import { DataSource } from "typeorm";
import * as entities from "../entities";

/**
 * Keep a global reference so the same DataSource is reused across Lambda warm invocations.
 * This prevents connection storms and repeated initialization.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // @ts-ignore
  var __lmsDataSource: DataSource | undefined;
}


const createDataSource = () =>
  new DataSource({
    type: "mysql",
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: parseInt(process.env.DB_PORT ?? "3306", 10),
    username: process.env.DB_USER ?? "root",
    password: process.env.DB_PASS ?? "",
    database: process.env.DB_NAME ?? "lms",
    synchronize: false, // migrations only
    logging: false,
    entities: Object.values(entities),
    migrations: ["dist/migrations/*.js"],
    extra: {
      // tune connection pool; when using RDS Proxy this is less relevant
      connectionLimit: parseInt(process.env.DB_CONN_LIMIT ?? "5", 10),
    },
  });

if (!global.__lmsDataSource) {
  console.log("Creating new DataSource", process.env.DB_HOST);
  global.__lmsDataSource = createDataSource();
}

export const AppDataSource = global.__lmsDataSource as DataSource;

/**
 * Ensure the DataSource is initialized. Safe to call from Lambdas.
 */
export const initializeDataSource = async (): Promise<DataSource> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
};

/**
 * Destroy the connection (generally avoid calling this in Lambda - prefer reuse).
 */
export const destroyDataSource = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
};