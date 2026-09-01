import { Router } from "express";
import { Monitor } from "../types/monitor";
import { checkUrl } from "../services/monitor.service";
import { pool } from "../database/db";

const router = Router();

export const monitors: Monitor[] = [];
console.log("[ROUTES] Array de monitores criado");

router.get("/monitors", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM monitors ORDER BY id ASC"
        );

        res.json({
            monitors: result.rows
        });
    } catch (error) {
        console.error("[DB] Erro ao buscar monitores:", error);

        res.status(500).json({
            message: "Erro ao buscar monitores"
        });
    }
});

router.get("/monitors/:id", (req, res) => {
  const id = Number(req.params.id);

  const monitor = monitors.find((monitor) => monitor.id === id);

  if (!monitor) {
    return res.status(404).json({
      message: "Monitor não encontrado"
    });
  }

  res.json(monitor);
});

router.delete("/monitors/:id", (req, res) => {
    const id = Number(req.params.id);

    const index = monitors.findIndex((monitor) => monitor.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Monitor não encontrado"
        });
    }

    monitors.splice(index, 1);

    res.json({
        message: "Monitor removido com sucesso"
    });
});
router.put("/monitors/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { name, url } = req.body;

    const monitor = monitors.find((monitor) => monitor.id === id);

    if (!monitor) {
        return res.status(404).json({
            message: "Monitor não encontrado"
        });
    }
});
 router.post("/monitors", async (req, res) => {
    const { name, url } = req.body;

    if (!name || !url) {
        return res.status(400).json({
            message: "Nome e URL são obrigatórios"
        });
    }

    try {
        new URL(url);
    } catch {
        return res.status(400).json({
            message: "URL inválida"
        });
    }

    try {
        const existingMonitor = await pool.query(
            "SELECT * FROM monitors WHERE url = $1",
            [url]
        );

        if (existingMonitor.rows.length > 0) {
            return res.status(409).json({
                message: "Este monitor já está cadastrado",
                monitor: existingMonitor.rows[0]
            });
        }

        const result = await checkUrl(url);

        const dbResult = await pool.query(
            `INSERT INTO monitors (name, url, status)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, url, result.status]
        );

        console.log("[DB] Monitor adicionado:", dbResult.rows[0]);

        res.status(201).json({
            monitor: dbResult.rows[0],
            statusCode: result.statusCode,
            responseTime: result.responseTime
        });

    } catch (error) {
        console.error("[DB] Erro ao adicionar monitor:", error);

        res.status(500).json({
            message: "Erro ao adicionar monitor"
        });
    }
});

router.get("/monitors/:id/history", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const result = await pool.query(
      `
      SELECT
        monitor_id AS "monitorId",
        status,
        status_code AS "statusCode",
        response_time AS "responseTime",
        checked_at AS "checkedAt"
      FROM monitor_history
      WHERE monitor_id = $1
      ORDER BY checked_at ASC
      LIMIT 1000
      `,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("[DB] Erro ao buscar histórico:", error);

    res.status(500).json({
      message: "Erro ao buscar histórico"
    });
  }
});


export default router;