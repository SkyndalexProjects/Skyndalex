import { config } from "dotenv";
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
config();
import { PrismaClient } from "@prisma/client";
import chalk from "chalk";

import loadCommands from "./handlers/commandHandler.js";
import loadEvents from "./handlers/eventHandler.js";
import loadInteractions from "./handlers/interactionHandler.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.interactions = new Collection();
client.prisma = new PrismaClient();

loadEvents(client).then(() =>
  console.log(
    `${chalk.whiteBright(
      chalk.underline(`[${new Date().toUTCString()}]`),
    )} ${chalk.bold(chalk.red(`(CLIENT)`))} ${chalk.bold(
      chalk.blue("[1]"),
    )} ${chalk.bold(
      chalk.green(`Loaded events : ${client.eventNames().join(", ")}`),
    )}`,
  ),
);
loadCommands().then(() =>
  console.log(
    `${chalk.whiteBright(
      chalk.underline(`[${new Date().toUTCString()}]`),
    )} ${chalk.bold(chalk.red(`(CLIENT)`))} ${chalk.bold(
      chalk.blue("[1]"),
    )} ${chalk.bold(chalk.green(`Loaded commands`))}`,
  ),
);
loadInteractions(client).then(() =>
  console.log(
    `${chalk.whiteBright(
      chalk.underline(`[${new Date().toUTCString()}]`),
    )} ${chalk.bold(chalk.red(`(CLIENT)`))} ${chalk.bold(
      chalk.blue("[1]"),
    )} ${chalk.bold(chalk.green("Loaded interactions"))}`,
  ),
);
// loadInteractions(client).then(() =>
//     console.log(
//         `${chalk.whiteBright(
//             chalk.underline(`[${new Date().toUTCString()}]`)
//         )} ${chalk.bold(chalk.red(`(CLIENT)`))} ${chalk.bold(
//             chalk.blue("[200]")
//         )} ${chalk.bold(chalk.green("Loaded interactions"))}`
//     )
// );

process.on("unhandledRejection", async (reason, p) => {
  console.log(" [antiCrash] :: Unhandled Rejection/Catch");
  console.log(reason, p);
});

process.on("uncaughtException", async (err, origin) => {
  console.log(" [antiCrash] :: Uncaught Exception/Catch");
  console.log(err, origin);
});

process.on("uncaughtExceptionMonitor", async (err, origin) => {
  console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
  console.log(err, origin);
});

client.login(process.env.BOT_TOKEN);
