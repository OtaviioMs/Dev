import express from "express";
import monitorRoutes from "./routes/monitor.routes";
import { runMonitorCheck } from "./jobs/monitor.job";

const app = express();

app.use(express.json());

app.use(monitorRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "DevPulse API online 🚀"
  });
});

app.listen(3000, () => {
  console.log("DevPulse está rodando em http://localhost:3000");

  runMonitorCheck();

  setInterval(() => {
    runMonitorCheck().catch((error) => {
      console.error("[JOB ERROR]", error);
    });
  }, 30000);
});