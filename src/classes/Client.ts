import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import { Loaders } from "./Loaders";
import { PrismaClient } from "@prisma/client";
import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import fastifyFlash from "@fastify/flash";
import fastifyCors from "@fastify/cors";
import autoLoad from "@fastify/autoload";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import { FastifyRequest } from "fastify";
declare module "fastify" {
	interface FastifyRequest {
		client: SkyndalexClient;
	}
}

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
		const app = Fastify();
		app.register(fastifyCookie);
		app.register(fastifySession, {
			secret: process.env.SESSION_SECRET,
			cookie: { secure: true, httpOnly: true },
		}),
		app.register(fastifyFlash);
		app.register(fastifyCors, {
			origin: process.env.FRONTEND_URL,
			credentials: true,
		});
		app.addHook(
			"preHandler",
			async (request: FastifyRequest & { client: SkyndalexClient }) => {
				request.client = this;
			},
		);

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);


		app.register(autoLoad, {
			dir: path.join(__dirname, "../dashboard/routes"),
			routeParams: true,
		});

		try {
			app.listen({ port: Number(process.env.API_PORT) });
			app.log.info(`[server] listening on ${app.server.address()}`);
		} catch (err) {
			app.log.error(err);
		}

		app.ready(() => {
			console.log(app.printRoutes())
		})
		
		await this.loader.loadEvents(this, "../events");

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
