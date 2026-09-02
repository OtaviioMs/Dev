import "dotenv/config";
import fs from "fs";
import path from "path";
import { pool } from "../src/database/db";

async function initDatabase() {
  try {
    const schemaPath = path.join(process.cwd(), "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    console.log("📦 Executando schema.sql...");

    await pool.query(schema);

    console.log("✅ Banco de dados inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();