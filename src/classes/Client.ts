import "dotenv/config";
import {
	ActivityType,
	Client,
	Collection,
	GatewayIntentBits,
	Partials,
} from "discord.js";
import { Loaders, Logger } from "#classes";
import { join, dirname } from "node:path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { DashboardServer } from "../dashboard/server.js";
import { BlackjackState, Command, Component } from "../types/index.js";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { RadioPlayer } from "#modules";
import { Connectors, Shoukaku } from "shoukaku";
import { deploy } from "#utils";
import { GlobalFonts } from "@napi-rs/canvas";
import { PrismaPg } from "@prisma/adapter-pg";

const Nodes = [
	{
		name: "SkyndalexLava",
		url: process.env.LAVALINK_URL as string,
		auth: process.env.LAVALINK_SERVER_PASSWORD as string,
	},
];
console.log("Nodes", Nodes);
const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});
interface radioStatus {
	requestedBy: string;
	radioStation: string;
	resourceUrl: string;
	voiceChannelId: string;
	executionDate: number;
	status: "playing" | "stopped" | "switched";
}
export class SkyndalexClient extends Client {
	loader = new Loaders();
	prisma = new PrismaClient({ adapter });
	dashboard = new DashboardServer(this);
	commands: Collection<string, Command> = new Collection();
	components: Collection<string, Component> = new Collection();
	shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes);
	radio = new RadioPlayer(this);
	radioInstances = new Map<string, radioStatus>();
	blackjackGames = new Map<string, BlackjackState>();
	i18n = i18next;

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
		const __dirname = dirname(fileURLToPath(import.meta.url));
		GlobalFonts.registerFromPath(
			join(__dirname, "..", "assets", "fonts", "dotmatri.ttf"),
			"DotMatrix",
		);
		GlobalFonts.registerFromPath(
			join(__dirname, "..", "assets", "fonts", "MyriadPro-Regular.ttf"),
			"MyriadPro",
		);
		GlobalFonts.registerFromPath(
			join(__dirname, "..", "assets", "fonts", "gg-sans.ttf"),
			"ggsans",
		);

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
		this.shoukaku.on("ready", (name) =>
			console.log(`Lavalink: Client ${name} is connected to the server.`),
		);
		this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes);

		this.shoukaku.on('error', (name, error) => {
			console.error(`[LAVALINK] node ${name} errored:`, error)
		})

		this.shoukaku.on('close', (name, code, reason) => {
			console.warn(`[LAVALINK] Node ${name} closed: ${code} | ${reason}`);
		});

		this.shoukaku.on('disconnect', (name, players, moved) => {
			console.warn(`[LAVALINK] Node ${name} disconnected.`);
		});

		await this.login(token);
		this.commands = await this.loader.loadCommands("../commands");
		this.components = await this.loader.loadComponents("../components");
		await deploy(this);

		if (token === process.env.BOT_TOKEN) {
			console.log("[Server] :: Initializing dashboard");
			await this.dashboard.init();
			console.log("[Server] :: Dashboard initialized");
			console.log("[Server] :: Initializing auth server");
			console.log("[Server] :: Auth server initialized");
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
