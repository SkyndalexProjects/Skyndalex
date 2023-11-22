import { config } from "dotenv";
import { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder } from "discord.js";
config();
import { PrismaClient } from "@prisma/client";
import chalk from "chalk";

import loadCommands from "./handlers/commandHandler.js";
import loadEvents from "./handlers/eventHandler.js";
import loadInteractions from "./handlers/interactionHandler.js";
import { Shoukaku, Connectors } from "shoukaku";

import express from "express";
import Topgg from "@top-gg/sdk";

const app = express();
const webhook = new Topgg.Webhook(process.env.TOPGG_WEBHOOK_AUTH);

const Nodes = [
  {
    name: "Localhost",
    url: "127.0.0.1:6969",
    auth: "youshallnotpass",
  },
];

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
const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);
shoukaku.on("error", (_, error) => console.error(error));

client.shoukaku = shoukaku;
client.interactions = new Collection();
client.prisma = new PrismaClient();

app.post("/dblwebhook", webhook.listener(vote => {
    console.log(vote.user)

    const user = client.users.cache.get(vote.user);
    if (!user) return client.users.fetch(vote.user);
    const embed = new EmbedBuilder()
        .setTitle(`${user.username} just voted!`)
        .setFooter({ text: `ID: ${vote.user}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setColor("Green")
        .setTimestamp()
    client.channels.cache.get("1176945793631015074").send({ embeds: [embed] })
}))

app.listen(3001, () => console.log(chalk.bold(chalk.green("[TOPGG] Listening on port 3001"))));

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
