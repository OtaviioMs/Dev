export interface Monitor {
  id: number;
  name: string;
  url: string;
  status: "pending" | "up" | "down";
}