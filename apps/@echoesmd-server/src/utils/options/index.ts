import type { EchoesServerOptions } from "../../types";

export const options: EchoesServerOptions = {
  hocus: {
    port: 4000,
  },
  hono: {
    port: 8080,
  },
  database: {
    database: "db.sqlite",
  },
  cors: {
    origin: ["http://localhost:3000", "http://localhost:1420", "http://localhost:5173"],
    default: "http://localhost:3000",
  },
};