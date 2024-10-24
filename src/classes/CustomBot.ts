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
import { Loaders, Logger, type SkyndalexClient } from "#classes";
import type { Command, Component, Modal } from "#types";

const Nodes = [
	{
		name: "SkyndalexLava",
		url: process.env.LAVALINK_URL,
		auth: process.env.LAVALINK_SERVER_PASSWORD,
	},
];

export class CustomBot extends Client {
	prisma = new PrismaClient();
	logger = new Logger();
	createdAt = performance.now();

	loader = new Loaders();
	shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes);
	i18n = i18next;

	constructor(
		public token: string,
		public commands: Collection<string, Command>,
		public components: Collection<string, Component>,
		public modals: Collection<string, Modal>,
		presence?: string,
	) {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildVoiceStates,
			],
			partials: [Partials.Message],
			allowedMentions: { repliedUser: false },
			presence: {
				activities: [
					{
						name:
							presence ??
							`Version: ${process.env.npm_package_version} | discord.skyndalex.com`,
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

		this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes);

		this.shoukaku.on("error", (_, error) =>
			console.error(`[LAVALINK] :: ${error}`),
		);

		this.shoukaku.on("ready", (name) =>
			this.logger.log(
				`Lavalink: Client ${name} is connected to the server.`,
			),
		);

		await this.loader.loadEvents(
			this as unknown as SkyndalexClient,
			"../events",
		);

		this.login(this.token);
	}
}
