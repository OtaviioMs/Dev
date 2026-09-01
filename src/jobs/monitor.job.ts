import { checkUrl } from "../services/monitor.service";
import { MonitorHistory } from "../types/monitor-history";
import { pool } from "../database/db";

export const history: MonitorHistory[] = [];

const MAX_HISTORY = 1000;

export async function runMonitorCheck() {
  console.log("[JOB] Executando verificação...");

  const dbResult = await pool.query(
  "SELECT * FROM monitors ORDER BY id ASC"
);

const monitors = dbResult.rows;

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

await pool.query(
  `
  UPDATE monitors
  SET
    status = $1,
    status_code = $2,
    response_time = $3
  WHERE id = $4
  `,
  [
    result.status,
    result.statusCode,
    result.responseTime,
    monitor.id
  ]
);

await pool.query(
  `
  INSERT INTO monitor_history
    (monitor_id, status, status_code, response_time, checked_at)
  VALUES
    ($1, $2, $3, $4, $5)
  `,
  [
    monitor.id,
    result.status,
    result.statusCode,
    result.responseTime,
    new Date()
  ]
);

if (history.length > MAX_HISTORY) {
    history.shift();
}

    console.log(
      `[MONITOR] ${monitor.name} → ${monitor.status} (${result.responseTime}ms)`
    );
  }
}