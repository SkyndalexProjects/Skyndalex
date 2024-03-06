import { PrismaClient } from "@prisma/client";
import chalk from "chalk";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import loadCommands from "./handlers/commandHandler.js";
import loadEvents from "./handlers/eventHandler.js";
import loadInteractions from "./handlers/interactionHandler.js";
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

console.log(
  `${chalk.whiteBright(
    chalk.underline(`[${new Date().toUTCString()}]`),
  )} ${chalk.bold(chalk.red(`(CLIENT - CUSTOMBOT)`))} ${chalk.bold(
    chalk.blue("[1]"),
  )} ${chalk.bold(chalk.green(`Started running on custom bot`))}`,
);

client.prisma = new PrismaClient();
client.interactions = new Collection();

(async () => {
  await loadEvents(client);
  await loadInteractions(client);
  await loadCommands();
  const login = client.login(process.env.BOT_TOKEN).catch(() => null);
  if (!login) return;
})();
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
