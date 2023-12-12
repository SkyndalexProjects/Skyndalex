import { PrismaClient } from "@prisma/client";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import loadCommands from "./handlers/commandHandler.js";
import loadEvents from "./handlers/eventHandler.js";
import loadInteractions from "./handlers/interactionHandler.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
client.prisma = new PrismaClient();
client.interactions = new Collection();

(async () => {
  const { token } = await client.prisma.customBots.findUnique({
    where: { userId: process.argv[2] },
  });

  await loadEvents(client);
  await loadInteractions(client);
  await loadCommands();

  client.login(token);
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
