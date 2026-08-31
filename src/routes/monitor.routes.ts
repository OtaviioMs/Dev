

import { Router } from "express";
import { Monitor } from "../types/monitor";
import { checkUrl } from "../services/monitor.service";
import { history } from "../jobs/monitor.job";

const router = Router();

export const monitors: Monitor[] = [];
console.log("[ROUTES] Array de monitores criado");

router.get("/monitors", (req, res) => {
  res.json({
    monitors
  });
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

    monitor.name = name;
    monitor.url = url;

    const result = await checkUrl(url);

    monitor.status = result.status;

    res.json({
        ...monitor,
        statusCode: result.statusCode,
        responseTime: result.responseTime
    });
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
const existingMonitor = monitors.find(
    (monitor) => monitor.url === url
);

if (existingMonitor) {
    return res.status(409).json({
        message: "Este monitor já está cadastrado",
        monitor: existingMonitor
    });
}
  const monitor: Monitor = {
    id: monitors.length + 1,
    name,
    url,
    status: "pending"
  };

  const result = await checkUrl(url);

monitor.status = result.status;

  monitors.push(monitor);

  console.log("[ROUTES] Monitor adicionado:", monitor);
console.log("[ROUTES] Total de monitores:", monitors.length);

  res.status(201).json({
  ...monitor,
  statusCode: result.statusCode,
  responseTime: result.responseTime
});
});
router.get("/monitors/:id/history", (req, res) => {
    const id = Number(req.params.id);

    const monitorHistory = history.filter(
        (item) => item.monitorId === id
    );

    res.json(monitorHistory);
});

export default router;