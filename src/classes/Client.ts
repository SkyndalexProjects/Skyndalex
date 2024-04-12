import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { Loaders } from "./Loaders";

export class SkyndalexClient extends Client {
	prisma = new PrismaClient();

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			],
			partials: [Partials.Message],
			allowedMentions: {repliedUser: false},
			presence: {
				activities: [
					{
						name: `Check out new ${process.env.npm_package_version} version!`,
						type: ActivityType.Playing,
					},
				],
			},
		});
	}

	async init() {
		await Loaders.loadEvents(this, "./src/events");
		this.commands = await Loaders.loadCommands("../commands");

		await this.login(process.env.BOT_TOKEN)
	}
}