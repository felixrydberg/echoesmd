import { startServer, stopServer, restartServer } from "../utils/server";
import type { Command } from "commander";

export const createServerCommands = (command: Command) => {
  command
    .command("server")
    .description("Manage the server, start, stop or restart it")
    .option("-action <action>", "Start, Stop or Restart the server")
    .option("-status", "Status of the server")
    .action((str) => {
      if (str.Status) {
        console.log("Status of the server");
      } else if (str.Action) {
        switch (str.Action) {
          case "start":
            console.log("Starting server")
            startServer();
            break;
          case "stop":
            console.log("Stopping server")
            stopServer();
            break;
          case "restart":
            console.log("Restarting server")
            restartServer();
            break;
          default:
            console.log("Invalid action");
            break;
        }
      }
    });
};