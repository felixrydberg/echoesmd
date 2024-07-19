import type { DatabaseConfiguration } from "@hocuspocus/extension-database";

export interface EchoesServerOptions {
  hocus: {
    port: number,
  },
  hono: {
    port: number,
  },
  database: {
    database: string,
  },
  cors: {
    origin: string[],
    default: string,
  }
}

export interface HocuspocusInformation {
  status: "stopped" | "running",
}

export interface ExtensionConfiguration extends DatabaseConfiguration {
  database: string,
}

export interface User {
  id: string,
  username: string,
  password: string,
  admin: boolean,
}
