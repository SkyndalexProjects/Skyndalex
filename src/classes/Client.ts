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
import type { Command, Component, Modal } from "../types/structures.js";
import { Loaders } from "./Loaders.js";
import { Logger } from "./Logger.js";
import { CaseManagement } from "./modules/CasesManagement.js";
import { RadioPlayer } from "./modules/RadioPlayer.js";
import { Connectors, Shoukaku } from "shoukaku";

const Nodes = [
	{
		name: "Skyndalex:Lavalink",
		url:  process.env.LAVALINK_URL,
		auth: process.env.LAVALINK_AUTH,
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

		this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes);
		this.shoukaku.on("error", (_, error) => console.error(error));

		await this.loader.loadEvents(this, "../events");
		await this.loader.loadCommands("../commands");
		this.components = await this.loader.loadComponents("../components");
		this.modals = await this.loader.loadModals("../modals");
		await this.login(process.env.BOT_TOKEN);
	}
}
