import { Routes } from "discord.js";

export async function ready(client) {

	const parsedCommands = [];
	if (client.user.id === process.env.CLIENT_ID) {
		try {

			for (const [key, cmd] of client.commands.entries()) {
				if (key.includes("/")) {
					const [name, subcommand] = key.split("/");
					if (subcommand !== "index") continue;
					const subcommands = client.commands.filter(
						(value, subKey) =>
							subKey.startsWith(`${name}/`) &&
							subKey !== `${name}/index`,
					);
					const command = cmd.data;
					for (const [subKey, subcmd] of subcommands.entries()) {
						command.addSubcommand(subcmd.data);
					}
					parsedCommands.push(command);
				} else {
					parsedCommands.push(cmd.data);
				}
			}

			const globalData = await client.rest.put(
				Routes.applicationCommands(client.user.id),
				{ body: parsedCommands },
			);

			client.logger.success(
				`[READY] Successfully registered ${globalData.size} commands globally.`,
			);
		} catch (e) {
			console.error(e);
		}

		const presences = [
			`Check out new 1.3.7 update! (/updates)`,
			`Site https://skyndalex.xyz (soon)`,
			`Docs: https://docs.skyndalex.xyz`,
		];

		setInterval(() => {
			const presence =
				presences[Math.floor(Math.random() * presences.length)];
			client.user.setPresence({
				activities: [{ name: presence }],
			});
		}, 5000);

		const getAllCustombots = await client.prisma.customBots.findMany();

		for (const bot of getAllCustombots) {
			await client.customBotManager.init(bot.clientId, bot.token);
			await client.customBotManager.deployCommands(
				parsedCommands,
				bot.clientId,
				bot.token,
			);
		}
	}
}
