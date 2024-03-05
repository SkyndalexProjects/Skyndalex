import chalk from "chalk";
import { REST, Routes, StringSelectMenuOptionBuilder } from "discord.js";
import { commands } from "../handlers/commandHandler.js";
import { execSync, fork } from "child_process";

export default async function ready(client) {
  const presences = [
    `Check out new 1.3.7 update! (/updates)`,
    `Site https://skyndalex.xyz (soon)`,
    `Docs: https://docs.skyndalex.xyz`,
  ];

  setInterval(() => {
    const presence = presences[Math.floor(Math.random() * presences.length)];
    client.user.setPresence({
      activities: [{ name: presence }],
    });
  }, 5000);

  try {
    console.log(
      `${chalk.whiteBright(
        chalk.underline(`[${new Date().toUTCString()}]`),
      )} ${chalk.bold(chalk.red(`(CLIENT)`))} ${chalk.bold(
        chalk.blue("[1]"),
      )} ${chalk.bold(
        chalk.yellowBright(
          `Started refreshing application (/) commands. (${commands.size})`,
        ),
      )}`,
    );

    const cmds = commands.map((cmd) => cmd.data.toJSON());

    const globalData = await client.rest.put(
      Routes.applicationCommands(client.user.id),
      { body: cmds },
    );

    console.log(
      `${chalk.whiteBright(
        chalk.underline(`[${new Date().toUTCString()}]`),
      )} ${chalk.bold(chalk.red(`(CLIENT)`))} ${chalk.bold(
        chalk.blue("[1]"),
      )} ${chalk.bold(
        chalk.yellowBright(`Successfully reloaded application (/) commands.`),
      )}`,
    );

    console.table(
      globalData.map((cmd) => {
        return {
          Name: cmd.name,
          Description: cmd.description,
          Type: cmd.type,
        };
      }),
    );
  } catch (e) {
    console.error(e);
  }

  const getAllCustombots = await client.prisma.customBots.findMany()

  for (const bot of getAllCustombots) {
    await client.prisma
      .$executeRawUnsafe(`CREATE DATABASE customBot_${bot.clientId};`)
      .catch(() => null);

    const DBURL = `postgresql://postgres:${process.env.CUSTOMBOT_DB_PASSWORD}@localhost:5432/custombot_${bot.clientId}?schema=public`;

    execSync(`SET DATABASE_URL=${DBURL} && npx prisma db push`, {
      stdio: "inherit",
    });

    await fork("customBot", [bot.clientId], {
      env: {
        BOT_TOKEN: bot.token,
        CUSTOMBOT_DB_PASSWORD: process.env.CUSTOMBOT_DB_PASSWORD,
        DATABASE_URL: DBURL,
        CLIENT_ID: process.env.CLIENT_ID,
        TOPGG_WEBHOOK_AUTH: process.env.TOPGG_WEBHOOK_AUTH,
        HF_TOKEN: process.env.HF_TOKEN,
        SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
        SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
        SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,
        DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI,
        DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
        DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
        THEDOGAPI_KEY: process.env.THEDOGAPI_KEY,
        THECATAPI_KEY: process.env.THECATAPI_KEY,
      },
    });

    const rest = new REST({ version: "10" }).setToken(bot.token);

    const cmds = commands.map((cmd) => cmd.data.toJSON());


    await rest.put(Routes.applicationCommands(bot.clientId), {
      body: cmds,
    }).catch(() => null);
  }
}
