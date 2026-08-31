import { monitors } from "../routes/monitor.routes";
import { checkUrl } from "../services/monitor.service";
import { MonitorHistory } from "../types/monitor-history";

export const history: MonitorHistory[] = [];

const MAX_HISTORY = 1000;

export async function runMonitorCheck() {
  console.log("[JOB] Executando verificação...");
  console.log(`[JOB] Monitores cadastrados: ${monitors.length}`);

  for (const monitor of monitors) {
    const result = await checkUrl(monitor.url);

    monitor.status = result.status;

    monitor.statusCode = result.statusCode;
monitor.responseTime = result.responseTime;
history.push({
    monitorId: monitor.id,
    status: result.status,
    statusCode: result.statusCode,
    responseTime: result.responseTime,
    checkedAt: new Date().toISOString()
});

if (history.length > MAX_HISTORY) {
    history.shift();
}

    console.log(
      `[MONITOR] ${monitor.name} → ${monitor.status} (${result.responseTime}ms)`
    );
  }
}