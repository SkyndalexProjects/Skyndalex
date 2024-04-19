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
import { Connectors, Shoukaku } from "shoukaku";
import type { Command, Component } from "../types/structures";
import { Loaders } from "./Loaders";
import { Logger } from "./Logger";
const Nodes: { name: string; auth: string; url: string }[] = [
	{
		name: "Localhost",
		url: "127.0.0.1:6969",
		auth: process.env.LAVALINK_AUTH,
	},
];

export class SkyndalexClient extends Client {
	prisma = new PrismaClient();
	logger = new Logger();
	createdAt = performance.now();
	shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes);

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
		this.shoukaku.on("error", (_, error) => console.log(error));
		this.shoukaku.on("ready", (_, error) =>
			this.logger.success("Lavalink is ready!"),
		);

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
