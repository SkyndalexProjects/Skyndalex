import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import {
	ActivityType,
	Client,
	Collection,
	GatewayIntentBits,
	Partials,
} from "discord.js";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { Connectors, Shoukaku } from "shoukaku";
import { Loaders, Logger } from "#classes";
import { CaseManagement, CustomBotManagement, RadioPlayer } from "#modules";
import type { Command, Component, Modal } from "#types";
import { checkMissingTranslations } from "#utils";
const Nodes = [
	{
		name: "Localhost",
		url: process.env.LAVALINK_URL,
		auth: process.env.LAVALINK_SERVER_PASSWORD,
	},
];

export class SkyndalexClient extends Client {
	prisma = new PrismaClient();
	logger = new Logger();
	createdAt = performance.now();

	commands: Collection<string, Command> = new Collection<string, Command>();
	components: Collection<string, Component>;
	modals: Collection<string, Modal>;
	loader = new Loaders(this);
	cases = new CaseManagement(this);
	shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes);
	radio = new RadioPlayer(this);
	custombots = new CustomBotManagement(this);

	i18n = i18next;

	constructor() {
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
						name: `Version: ${process.env.npm_package_version} | discord.skyndalex.com `,
						type: ActivityType.Playing,
					},
				],
			},
		});
	}

	async init(token: string) {
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
			console.log(`[LAVALINK] :: Connected successfully to ${name}`),
		);

		await this.loader.loadEvents(this, "../events");
		this.commands = await this.loader.loadCommands("../commands");

		this.components = await this.loader.loadComponents("../components");
		this.modals = await this.loader.loadModals("../modals");

		checkMissingTranslations();

		await this.login(token);

		process.on("unhandledRejection", async (reason, p) => {
			console.log(" [antiCrash] :: Unhandled Rejection/Catch");
			console.log(reason, p);
		});

		process.on("uncaughtException", async (err, origin) => {
			console.log(" [antiCrash] :: Uncaught Exception/Catch");
			console.log(err, origin);
		});

		process.on("uncaughtExceptionMonitor", async (err, origin) => {
			console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
			console.log(err, origin);
		});
	}
}
