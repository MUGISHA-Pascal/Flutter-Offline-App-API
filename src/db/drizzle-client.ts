import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

console.log("Initializing database connection...");

const pool = new Pool({
  // connectionString: "postgresql://postgres:postgres@db:5432/task_manager",
  connectionString:
    "postgresql://postgres:postgres@localhost:5432/task_manager",
});

console.log("Database pool created successfully");

// Test database connection
pool.on('connect', () => {
  console.log("Database connected successfully");
});

pool.on('error', (err) => {
  console.error("Database connection error:", err);
});

export const db = drizzle(pool);

console.log("Drizzle ORM initialized");
