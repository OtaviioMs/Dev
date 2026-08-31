export interface Monitor {
    id: number;
    name: string;
    url: string;
    status: "up" | "down" | "pending";
  statusCode?: number | null;
    responseTime?: number;
}