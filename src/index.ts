#!/usr/bin/env node
import { Command } from "commander";
import { createRequire } from "module";
import { addCommand } from "./commands/add";
import { initCommand } from "./commands/init";
import { listCommand } from "./commands/list";
import { pauseCommand } from "./commands/pause";
import { removeCommand } from "./commands/remove";
import { activeCommand } from "./commands/active";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const program = new Command();

program
  .name("supabase-keeper")
  .description("Supabase Keeper CLI")
  .version(pkg.version);

program.addCommand(initCommand);
program.addCommand(addCommand);
program.addCommand(listCommand);
program.addCommand(removeCommand);
program.addCommand(pauseCommand);
program.addCommand(activeCommand);

program.parse(process.argv);
