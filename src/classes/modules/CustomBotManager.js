import { execSync, fork } from "child_process";
import { REST, Routes } from "discord.js";
export class CustomBotManager {
	constructor(client) {
		this.client = client;
	}

	async init(clientId, botToken) {
		try {
			const result = await this.client.prisma
				.$executeRaw`CREATE DATABASE custombot_${clientId};`.catch(
				() => null,
			);
			const DBURL = `postgresql://postgres:${encodeURIComponent(process.env.CUSTOMBOT_DB_PASSWORD)}@localhost:5432/custombot_${clientId}?schema=public`;

			switch (process.platform) {
				case "win32":
					execSync(
						`SET DATABASE_URL=${DBURL} && npx prisma db push`,
						{
							stdio: "inherit",
						},
					);
					break;
				case "linux":
					execSync(
						`export DATABASE_URL=${DBURL} && npx prisma db push`,
						{
							stdio: "inherit",
						},
					);
					break;
			}

			const processInfo = await fork("./src/customBot", [clientId], {
				env: {
					BOT_TOKEN: botToken,
					CUSTOMS_LIMIT: 3,
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

			const presences = await this.client.prisma.customBots.findMany({
				where: {
					clientId: clientId,
				},
			});
			if (presences.length < 1) return;

			processInfo.send({
				name: "changePresence",
				presence: presences[0].customPresenceName,
			});
		} catch (error) {
			console.error(error);
		}
	}
	async deployCommands(commands, clientId, botToken) {
		const rest = new REST({ version: "10" }).setToken(botToken);

		await rest
			.put(Routes.applicationCommands(clientId), { body: commands })
			.catch(() => null);
	}
}
