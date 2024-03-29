import { SkyndalexClient } from './classes/Client.js';
new SkyndalexClient().init();
// import { config } from "dotenv";
// config()
// import chalk from "chalk";
// import {
//   EmbedBuilder,
//   GatewayIntentBits,
//   Partials,
// } from "discord.js";
// import Base from "./classes/Client.js";
// import loadCommands from "./handlers/commandHandler.js";
// import loadEvents from "./handlers/eventHandler.js";
// import loadInteractions from "./handlers/interactionHandler.js";
//
// import Topgg from "@top-gg/sdk";
// import express from "express";
// import loadRouters from "./auth/app.js";
// const app = express();
// const webhook = new Topgg.Webhook(process.env.TOPGG_WEBHOOK_AUTH);
//
// const client = new Base({
//   intents: [
//     GatewayIntentBits.Guilds,
//     GatewayIntentBits.GuildMessages,
//     GatewayIntentBits.MessageContent,
//     GatewayIntentBits.GuildMembers,
//     GatewayIntentBits.GuildModeration,
//     GatewayIntentBits.GuildPresences,
//     GatewayIntentBits.GuildVoiceStates,
//     GatewayIntentBits.GuildScheduledEvents,
//   ],
//   partials: [Partials.Message, Partials.Channel, Partials.Reaction],
// });
// console.log(
//   `${chalk.whiteBright(
//     chalk.underline(`[${new Date().toUTCString()}]`),
//   )} ${chalk.bold(chalk.red(`(CLIENT)`))} ${chalk.bold(
//     chalk.blue("[1]"),
//   )} ${chalk.bold(chalk.green(`Starting running on general bot`))}`,
// );
//
// app.post(
//   "/dblwebhook",
//   webhook.listener(async (vote) => {
//     const user = client.guilds.cache
//       .get("1058882286210261073")
//       .members.cache.get(vote.user);
//     if (!user) return client.users.fetch(vote.user);
//
//     const role = client.guilds.cache
//       .get("1058882286210261073")
//       .roles.cache.get("1177715371822813275");
//     await user.roles.add(role.id);
//
//     const embed = new EmbedBuilder()
//       .setTitle(`${user.user.username} just voted!`)
//       .setFooter({
//         text: `ID: ${vote.user}`,
//         iconURL: user.user.displayAvatarURL({ dynamic: true }),
//       })
//       .setColor("Green")
//       .setURL(`https://top.gg/bot/${client.user.id}`)
//       .setTimestamp();
//     client.channels.cache.get("1176945793631015074").send({ embeds: [embed] });
//   }),
// );
//
// app.listen(2137, () =>
//   console.log(chalk.bold(chalk.green("[TOPGG] Listening on port 2137"))),
// );
//
// loadRouters(client).then(() =>
//   console.log(
//     `${chalk.whiteBright(
//       chalk.underline(`[${new Date().toUTCString()}]`),
//     )} ${chalk.bold(chalk.red(`(APPs)`))} ${chalk.bold(
//       chalk.blue("[1]"),
//     )} ${chalk.bold(chalk.green(`Loaded routers`))}`,
//   ),
// );
// loadEvents(client).then(() =>
//   console.log(
//     `${chalk.whiteBright(
//       chalk.underline(`[${new Date().toUTCString()}]`),
//     )} ${chalk.bold(chalk.red(`(CLIENT)`))} ${chalk.bold(
//       chalk.blue("[1]"),
//     )} ${chalk.bold(
//       chalk.green(`Loaded events : ${client.eventNames().join(", ")}`),
//     )}`,
//   ),
// );
// loadCommands().then(() =>
//   console.log(
//     `${chalk.whiteBright(
//       chalk.underline(`[${new Date().toUTCString()}]`),
//     )} ${chalk.bold(chalk.red(`(CLIENT)`))} ${chalk.bold(
//       chalk.blue("[1]"),
//     )} ${chalk.bold(chalk.green(`Loaded commands`))}`,
//   ),
// );
// loadInteractions(client).then(() =>
//   console.log(
//     `${chalk.whiteBright(
//       chalk.underline(`[${new Date().toUTCString()}]`),
//     )} ${chalk.bold(chalk.red(`(CLIENT)`))} ${chalk.bold(
//       chalk.blue("[1]"),
//     )} ${chalk.bold(chalk.green("Loaded interactions"))}`,
//   ),
// );
//
// process.on("unhandledRejection", async (reason, p) => {
//   console.log(" [antiCrash] :: Unhandled Rejection/Catch");
//   console.log(reason, p);
// });
//
// process.on("uncaughtException", async (err, origin) => {
//   console.log(" [antiCrash] :: Uncaught Exception/Catch");
//   console.log(err, origin);
// });
//
// process.on("uncaughtExceptionMonitor", async (err, origin) => {
//   console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
//   console.log(err, origin);
// });
// client.login(process.env.BOT_TOKEN);
