import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import { Loaders } from "./Loaders";
import { InitServer } from "dashboard/app";
import { PrismaClient } from "@prisma/client";
export class SkyndalexClient extends Client {
	loader = new Loaders();
	prisma = new PrismaClient();

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.MessageContent,
			],
			partials: [Partials.Message],
			allowedMentions: { repliedUser: false },
			presence: {
				activities: [
					{
						name: `Version: ${process.env.npm_package_version} | discord.skyndalex.com`,
						type: ActivityType.Playing,
					},
				],
			},
		});
	}

	async init(token: string) {
		await this.loader.loadEvents(this, "../events");

		InitServer(this);
		await this.login(token);

		process.on("unhandledRejection", async (reason, p) => {
			console.log(" [antiCrash] :: Unhandled Rejection/Catch");
			console.log(reason, p);
		});

		process.on("uncaughtException", async (err, origin) => {
			console.log(" [antiCrash] :: Uncaught Exception/Catch");
			console.log(err, origin);
		});
	}
}
