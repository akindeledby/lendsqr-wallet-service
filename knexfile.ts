import type { Knex } from "knex";
import * as dotenv from "dotenv";

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: Number(process.env.DB_PORT) || 3306,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./seeds",
    },
  },

  production: {
    client: "mysql2",
    connection: {
      host: process.env.PROD_DB_HOST,
      user: process.env.PROD_DB_USER,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
      port: Number(process.env.PROD_DB_PORT) || 3306,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./seeds",
    },
  },
};

export default config;
