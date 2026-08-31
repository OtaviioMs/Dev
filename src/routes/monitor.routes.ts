

import { Router } from "express";
import { Monitor } from "../types/monitor";
import { checkUrl } from "../services/monitor.service";

const router = Router();

const monitors: Monitor[] = [];

router.get("/monitors", (req, res) => {
  res.json({
    monitors
  });
});

router.post("/monitors", async (req, res) => {
  const { name, url } = req.body;

  const monitor: Monitor = {
    id: monitors.length + 1,
    name,
    url,
    status: "pending"
  };

  const result = await checkUrl(url);

monitor.status = result.status;

  monitors.push(monitor);

  res.status(201).json({
  ...monitor,
  statusCode: result.statusCode,
  responseTime: result.responseTime
});
});

export default router;