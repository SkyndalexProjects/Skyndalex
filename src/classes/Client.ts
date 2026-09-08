import "dotenv/config";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GlobalFonts } from "@napi-rs/canvas";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import {
	ActivityType,
	Client,
	Collection,
	GatewayIntentBits,
	Options,
	Partials,
} from "discord.js";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import { createClient, type RedisClientType } from "redis";
import { Connectors, Shoukaku } from "shoukaku";
import { Loaders } from "#classes";
import { EconomyManager, RadioPlayer, RadioStateManager } from "#modules";
import { deploy } from "#utils";
import { DashboardServer } from "../dashboard/server.js";
import type {
	BlackjackState,
	Command,
	Component,
	RadioInstanceState,
} from "../types/index.js";
import { ErrorHandling } from "./ErrorHandling.js";
import { QuoteImageRenderer } from "./modules/canvas/QuoteImageRenderer.js";
import { DailyMailRenderer } from "./modules/canvas/DailyMailRenderer.js";
import { ChangeMyMindRenderer } from "./modules/canvas/ChangeMyMindRenderer.js";

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
declare module "discord.js" {
	interface Client {
		prisma: PrismaClient;
		radio: RadioPlayer;
		economy: EconomyManager;
		radioStateManager: RadioStateManager;
	}
}
export class SkyndalexClient extends Client {
	loader = new Loaders();
	prisma = new PrismaClient({ adapter });
	redis!: RedisClientType;
	dashboard = new DashboardServer(this);
	commands: Collection<string, Command> = new Collection();
	components: Collection<string, Component> = new Collection();
	shoukaku!: Shoukaku;
	radio = new RadioPlayer(this);
	economy = new EconomyManager(this);
	radioStateManager = new RadioStateManager(this);
	radioInstances = new Map<string, RadioInstanceState>();
	blackjackGames = new Map<string, BlackjackState>();
	canvas = {
		quote: new QuoteImageRenderer(),
		dailyMail: new DailyMailRenderer(),
		changeMyMind: new ChangeMyMindRenderer(),
	};
	voiceSessions = new Map<
		string,
		{ guildId: string; channelId: string; joinedAt: number }
	>();
	voiceTotals = new Map<string, number>();
	errorHandling = new ErrorHandling();
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
						name: `🎉 https://dashboard.skyndalex.com`,
						type: ActivityType.Playing,
					},
				],
			},
			sweepers: {
				...Options.DefaultSweeperSettings,
				messages: {
					interval: 3600,
					lifetime: 3600,
				},
				threads: {
					interval: 3600,
					lifetime: 3600,
				},
				users: {
					interval: 3_600,
					filter: () => (user) => user.bot && user.id !== user.client.user.id,
				},
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
		GlobalFonts.registerFromPath(
			join(__dirname, "..", "assets", "fonts", "Poppins-SemiBold.ttf"),
			"poppins",
		);

		GlobalFonts.registerFromPath(
			join(process.cwd(), "assets", "fonts", "RougeScript-Regular.ttf"),
			"RougeScript",
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

		this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes, {
			reconnectTries: 5,
			reconnectInterval: 5000,
			moveOnDisconnect: false,
		});

		this.shoukaku.on("ready", (name) =>
			console.log(`[LAVALINK] Client ${name} is connected to the server.`),
		);

		this.shoukaku.on("error", (name, error) => {
			console.error(`[LAVALINK] node ${name} errored:`, error);
		});

		this.shoukaku.on("close", (name, code, reason) => {
			console.warn(`[LAVALINK] Node ${name} closed: ${code} | ${reason}`);
		});

		this.shoukaku.on("disconnect", (name, count) => {
			console.warn(
				`[LAVALINK] Node ${name} disconnected. Players affected: ${count}`,
			);
		});

		await this.login(token);

		this.commands = await this.loader.loadCommands("../commands");
		this.components = await this.loader.loadComponents("../components");

		this.redis = createClient({
			url: process.env.REDIS_URL,
		});

		this.redis.on("connect", () => {
			console.log("[Redis] socket connected (TCP established)");
		});

		this.redis.on("ready", () => {
			console.log("[Redis] ready (handshake done, commands can run)");
		});

		this.redis.on("reconnecting", () => {
			console.warn("[Redis] reconnecting...");
		});

		this.redis.on("end", () => {
			console.warn("[Redis] connection closed");
		});

		this.redis.on("timeout", () => {
			console.error("[Redis] timeout");
		});
		this.redis.on("error", (err) => {
			console.error("[Redis] error", err);
		});

		await this.redis.connect();

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
