#!/usr/bin/env -S deno run -A

import { Command } from "cliffy";

import * as init from './cli/init.ts';
import * as deploy from './cli/deploy.ts';
import * as start from './cli/start.ts';

import Version from './version.json' assert { type: "json" }

await new Command()
  .name("kretes")
  .version(Version)
  .description("Web Framework for Deno")
  .command(
    "init [name:string]",
    "Create a new Kretes project"
  )
  .action(init.action)
  .command(
    "start",
    "Start the project in development mode"
  )
  .action(start.action)
  .command(
    "deploy",
    "Deploy the project to Deno Deploy"
  )
  .action(deploy.action)
  .parse(Deno.args);