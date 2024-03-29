import chalk from 'chalk';
import { Routes } from 'discord.js';

export async function ready(client) {
    if (client.user.id === process.env.CLIENT_ID) {
        try {
            const cmds = client.commands.map(command => command.data.toJSON());
            console.log(
                `${chalk.whiteBright(chalk.underline(`[${new Date().toUTCString()}]`))} ${chalk.bold(
                    chalk.red(`(CLIENT)`)
                )} ${chalk.bold(chalk.blue('[1]'))} ${chalk.bold(
                    chalk.yellowBright(`Started refreshing application (/) commands. (${cmds.size})`)
                )}`
            );

            const globalData = await client.rest.put(Routes.applicationCommands(client.user.id), { body: cmds });
            console.log(
                `${chalk.whiteBright(chalk.underline(`[${new Date().toUTCString()}]`))} ${chalk.bold(
                    chalk.red(`(CLIENT)`)
                )} ${chalk.bold(chalk.blue('[1]'))} ${chalk.bold(
                    chalk.greenBright(`Successfully reloaded application (/) commands [${globalData.size}].`)
                )}`
            );
        } catch (e) {
            console.error(e);
        }

        const presences = [
            `Check out new 1.3.7 update! (/updates)`,
            `Site https://skyndalex.xyz (soon)`,
            `Docs: https://docs.skyndalex.xyz`
        ];

        setInterval(() => {
            const presence = presences[Math.floor(Math.random() * presences.length)];
            client.user.setPresence({
                activities: [{ name: presence }]
            });
        }, 5000);

        const getAllCustombots = await client.prisma.customBots.findMany();

        for (const bot of getAllCustombots) {
            await client.customBotManager.init(bot.clientId, bot.token);
            await client.customBotManager.deployCommands(bot.clientId, bot.token);
        }
    }
}
