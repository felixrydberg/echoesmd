import { Hocuspocus, Server } from '@hocuspocus/server'
import { Database } from 'bun:sqlite'
import type { EchoesServerOptions } from '../types';

const createServer = (db: Database, options: EchoesServerOptions): {
  server: Hocuspocus,
} => {
  const server = Server.configure({
    port: options.hocus.port,
    async onAuthenticate(data) {
      const { token } = data;
      console.log("Authenticating vault 🔒:", token);
      // throw new Error("Not authorized!");
    },
    async onConnect(data) {
      console.log("Connecting to vault 🔗:");
    },
    maxDebounce: 1000,
    extensions: [],
  })

  return {
    server,
  }
}

export {
  createServer,
}
