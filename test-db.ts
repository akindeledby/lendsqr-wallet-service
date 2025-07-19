import knex from "knex";
import config from "./src/knexfile";

import dotenv from "dotenv";
dotenv.config();

const db = knex(config.production);

db.raw("SELECT 1")
  .then(() => {
    console.log("Database connection successful!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  });
