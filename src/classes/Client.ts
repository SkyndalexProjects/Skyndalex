import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import { Loaders } from "./Loaders.js";
import { PrismaClient } from "@prisma/client";
import { DashboardServer } from "../dashboard/server.js";

export class SkyndalexClient extends Client {
	loader = new Loaders();
	prisma = new PrismaClient();
	dashboard = new DashboardServer(this);
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
		await this.login(token);

		if (token === process.env.BOT_TOKEN) {
			console.log("[Server] :: Initializing dashboard");
			this.dashboard.init();
		} else {
			console.log(
				"[Server] :: Skipping dashboard initialization for custombot",
			);
		}

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
