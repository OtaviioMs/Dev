import express from "express";
import monitorRoutes from "./routes/monitor.routes";

const app = express();

app.use(express.json());

app.use(monitorRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "DevPulse API online 🚀"
  });
});

app.listen(3000, () => {
  console.log("DevPulse rodando em http://localhost:3000");
});