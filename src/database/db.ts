import { Pool } from "pg";
import "dotenv/config";

export const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "devpulse",
});

pool.query("SELECT NOW()")
    .then(() => console.log("✅ PostgreSQL conectado!"))
    .catch((err) => console.error("❌ Erro no PostgreSQL:", err));