export * from "./server";
import { createServerCommands } from "./server";
import { Command } from "commander";

export const createCli = async () => {
  const command = new Command();
  command
    .name("echoes-util")
    .description("Echoes utility CLI")
    .version("0.0.1");
  createServerCommands(command);

  return command.parse();
};
