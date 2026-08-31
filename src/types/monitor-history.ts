export interface MonitorHistory {
    monitorId: number;
    status: "up" | "down";
    statusCode: number | null;
    responseTime: number;
    checkedAt: string;
}