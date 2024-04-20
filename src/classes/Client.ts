import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import {
	ActivityType,
	Client,
	type Collection,
	GatewayIntentBits,
	Partials,
} from "discord.js";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import type { Command, Component } from "../types/structures";
import { Loaders } from "./Loaders";
import { Logger } from "./Logger";

export class SkyndalexClient extends Client {
	prisma = new PrismaClient();
	logger = new Logger();
	createdAt = performance.now();

	commands: Collection<string, Command>;
	components: Collection<string, Component>;

	loader = new Loaders();
	i18n = i18next;

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildVoiceStates,
			],
			partials: [Partials.Message],
			allowedMentions: { repliedUser: false },
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
		const __dirname = dirname(fileURLToPath(import.meta.url));
		await this.i18n.use(Backend).init({
			fallbackLng: "en-US",
			ns: ["responses", "commands"],
			defaultNS: "responses",
			preload: ["en-US", "pl"],
			backend: {
				loadPath: join(__dirname, "/../../i18n/{{lng}}/{{ns}}.json"),
			},
		});

		await this.loader.loadEvents(this, "../events");
		this.commands = await this.loader.loadCommands("../commands");
		this.components = await this.loader.loadComponents("../components");

		await this.login(process.env.BOT_TOKEN);
	}
}
