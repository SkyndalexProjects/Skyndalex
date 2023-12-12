import chalk from "chalk";
import { Routes } from "discord.js";
import { commands } from "../handlers/commandHandler.js";

export default async function ready(client) {
  const presences = [
    `Check out new AI update! (/updates)`,
    `Site https://skyndalex.xyz (soon)`,
    `Docs: https://docs.skyndalex.xyz (soon)`,
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
        chalk.yellowBright(
          `Successfully reloaded application (/) commands. (${globalData.length})`,
        ),
      )}`,
    );
  } catch (e) {
    console.error(e);
  }
}
