import { Routes } from 'discord.js';

export async function ready(client) {
    if (client.user.id === process.env.CLIENT_ID) {
        try {
            const cmds = client.commands.map(command => command.data.toJSON());
            client.logger.warn(`[READY] Starting refreshing global commands.`);

            const globalData = await client.rest.put(Routes.applicationCommands(client.user.id), { body: cmds });

            client.logger.success(`[READY] Successfully registered ${globalData.length} commands globally.`);
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
