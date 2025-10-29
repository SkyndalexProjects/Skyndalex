import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import fastifyFlash from "@fastify/flash";
import fastifyCors from "@fastify/cors";
import autoLoad from "@fastify/autoload";
import fastifyFormBody from "@fastify/formbody";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import type { SkyndalexClient } from "#classes";
import { auth } from "./auth.js";
import type { DiscordUser } from "../types/index.js";
import { PermissionFlagsBits } from "discord.js";
import serveStatic from "serve-static";
import { request } from "express";

declare module "fastify" {
	interface FastifyRequest {
		client: SkyndalexClient;
		user?: { id: string };
	}
}
export class DashboardServer {
	app: Fastify.FastifyInstance;
	client: SkyndalexClient;

	constructor(client: SkyndalexClient) {
		this.client = client;
		this.app = Fastify({ logger: true });
	}

	async init() {
		const app = this.app;
		app.register(fastifyCors, {
			origin: process.env.FRONTEND_URL || "http://localhost:3000",
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		});

		app.register(fastifyCookie);
		app.register(fastifySession, {
			secret: process.env.SESSION_SECRET || "defaultsecret",
			cookie: { secure: false, httpOnly: true, sameSite: "lax" },
		});
		app.register(fastifyFlash);
		app.route({
			method: ["GET", "POST"],
			url: "/api/auth/*",
			async handler(request, reply) {
				try {
					const url = new URL(request.url, `http://${request.headers.host}`);
					const headers = new Headers();

					Object.entries(request.headers).forEach(([key, value]) => {
						if (value) {
							if (Array.isArray(value)) {
								value.forEach((v) => headers.append(key, v));
							} else {
								headers.append(key, value.toString());
							}
						}
					});

					const req = new Request(url.toString(), {
						method: request.method,
						headers,
						body:
							request.body &&
							request.method !== "GET" &&
							request.method !== "HEAD"
								? JSON.stringify(request.body)
								: undefined,
					});

					const response = await auth.handler(req);
					reply.status(response.status);
					response.headers.forEach((value, key) => reply.header(key, value));
					reply.send(response.body ? await response.text() : null);
				} catch (error) {
					app.log.error("Authentication Error:", error);
					reply.status(500).send({
						error: "Internal authentication error",
						code: "AUTH_FAILURE",
					});
				}
			},
		});

		app.addHook("preHandler", async (request: FastifyRequest) => {
			request.client = this.client;
		});

		app.addHook(
			"preHandler",
			async (request: FastifyRequest, reply: FastifyReply) => {
				const pathOnly = request.url.split("?")[0];
				const isGuildPath = /^\/api\/guild(?:\/|$)/.test(pathOnly);

				if (isGuildPath) {
					const session = await auth.api.getSession({
						headers: request.headers,
					});
					const guildId = request.headers.guildid as string | undefined;
					if (!guildId || !/^\d{17,19}$/.test(guildId)) {
						console.log("im working");
						reply.status(400).send({ error: "Invalid guild ID format" });
						return;
					}
					if (!session) {
						reply.status(401).send({ error: "Unauthorized" });
						return;
					}
					const guild = request.client.guilds.cache.get(guildId);

					if (!guild) {
						reply.status(404).send({ error: "Not found" });
						return;
					}

					console.log("session user", session);
					//TODO: figure this stupid thing out

					// const dbUser = await request.client.prisma.account.findFirst({
					//     where: {
					//         userId: session.session.id,
					//     }
					// })
					// console.log("DB USER", dbUser);
					// const userDb = await auth.api.accountInfo({
					//     body: {
					//         accountId: session.session.userId,
					//     },
					//     headers: request.headers
					// })
					//
					// console.log("userDb", userDb);
					const { accessToken } = await auth.api.getAccessToken({
						body: {
							providerId: "discord",
							userId: session.session.userId,
						},
						headers: request.headers,
					});
					const response = await fetch("https://discord.com/api/users/@me", {
						headers: {
							authorization: `Bearer ${accessToken}`,
						},
					});
					if (!response.ok) {
						reply.status(response.status).send({
							error: "Failed to fetch user",
						});
						return;
					}

					const user = (await response.json()) as DiscordUser;
					const member = await guild.members.fetch(user.id);

					console.log("Member status", member);
					if (!member) {
						reply.status(404).send({ error: "Not found." });
						return;
					}

					if (!member.permissions.has(PermissionFlagsBits.ManageGuild)) {
						reply.status(403).send({ error: "Forbidden." });
						return;
					}
				} else {
					return;
				}
			},
		);

		app.addHook("preHandler", async (req, reply) => {
			const origin = req.headers.origin;

			if (origin === undefined || origin === process.env.FRONTEND_URL) {
				return;
			}
			reply.code(403).send({ error: "Forbidden" });
		});

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);

		app.register(autoLoad, {
			dir: path.join(__dirname, "../dashboard/routes"),
			routeParams: true,
		});

		app.register(fastifyFormBody);

		try {
			await app.listen({
				port: Number(process.env.API_PORT),
				host: "localhost",
			});
			app.log.info(`[server] listening on ${app.server.address()}`);
		} catch (err) {
			app.log.error(err);
		}

		app.ready(() => {
			console.log("[Server] :: Dashboard routes loaded");
		});

		return app;
	}
}

export default DashboardServer;
