const dotenv = require("dotenv");
dotenv.config();

import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log("Connected to Database");
  } catch (e) {
    console.error("Didn't work because: ", e);
  }
};

export { pool, connectDB };
