#!/usr/bin/env node
import { Command } from "commander";
import { addCommand } from "./commands/add";
import { initCommand } from "./commands/init";
import { listCommand } from "./commands/list";
import { removeCommand } from "./commands/remove";
// import { version } from '../package.json'; // This might cause issues with dist structure if package.json is not copied
const version = "1.0.0"; // Hardcode for now or use require

const program = new Command();

program
  .name("supabase-keeper")
  .description("Supabase Keeper CLI")
  .version(version);

program.addCommand(initCommand);
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(removeCommand);

program.parse(process.argv);
