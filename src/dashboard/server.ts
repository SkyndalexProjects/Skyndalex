import Fastify, {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
} from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import autoLoad from "@fastify/autoload";
import fastifyFormBody from "@fastify/formbody";
import websocket from "@fastify/websocket";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import type { SkyndalexClient } from "#classes";
import { auth } from "../auth.js";
import { Guild, GuildMember } from "discord.js";
import type { WebSocket } from "ws";

type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>;

declare module "fastify" {
	interface FastifyRequest {
		client: SkyndalexClient;
		user?: { id: string };
		session?: SessionData;
		guild?: Guild;
		member?: GuildMember;
	}
}
export class DashboardServer {
	app: Fastify.FastifyInstance;
	client: SkyndalexClient;
	wsSubscriptions = new Map<string, Set<WebSocket>>();
	constructor(client: SkyndalexClient) {
		this.client = client;
		this.app = Fastify({
			logger: {
				transport: {
					target: "pino-pretty",
					options: {
						translateTime: "HH:MM:ss Z",
						ignore: "pid,hostname",
						colorize: true,
					},
				},
			},
			trustProxy: true,
		});
	}

	async init() {
		const app = this.app;
		app.register(fastifyCors, {
			origin: [
				process.env.FRONTEND_URL,
				process.env.FRONTEND_DEV,
				"https://beta.skyndalex.com",
				"https://skyndalex.com",
				"https://api.skyndalex.com",
			] as string[],
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
			preflightContinue: false,
			optionsSuccessStatus: 204,
		});

		app.register(fastifyCookie, {
			secret: process.env.BETTER_AUTH_SECRET || "super-secret-key",
			parseOptions: {
				secure: process.env.NODE_ENV === "production",
				sameSite: "none",
				httpOnly: true,
			},
		});

		app.register(import("@fastify/rate-limit"), {
			max: 100,
			timeWindow: "1 minute",
		});

		app.addHook("preHandler", async (request: FastifyRequest) => {
			request.client = this.client;
		});
		app.addHook("preHandler", async (req, reply) => {
			if (req.method === "OPTIONS") return;
			const origin = req.headers.origin;
			const allowedOrigins = [
				process.env.FRONTEND_URL,
				process.env.FRONTEND_DEV,
				"https://beta.skyndalex.com",
				"https://skyndalex.com",
				"https://api.skyndalex.com",
			];

			if (origin && !allowedOrigins.includes(origin)) {
				app.log.warn(`Blocked origin: ${origin}`);
				return reply.code(403).send({ error: "Forbidden" });
			}
		});

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);

		app.register(autoLoad, {
			dir: path.join(__dirname, "../dashboard/routes"),
			routeParams: true,
		});

		app.register(fastifyFormBody);
		app.addHook(
			"preHandler",
			async (request: FastifyRequest, reply: FastifyReply) => {
				if (!request.url.startsWith("/auth/")) return;
				try {
					const forwardedProto =
						(request.headers["x-forwarded-proto"] as string) ||
						(request.headers["x-forwarded-protocol"] as string);
					const protocol = forwardedProto
						? forwardedProto.split(",")[0].trim()
						: "https";

					const forwardedHost =
						(request.headers["x-forwarded-host"] as string) ||
						(request.headers.host as string) ||
						"localhost" ||
						"127.0.0.1";

					const host = forwardedHost.split(",")[0].trim();

					const url = new URL(request.url, `${protocol}://${host}`);

					const headers = new Headers();

					const session = await auth.api.getSession({
						headers: request.headers as any,
					});

					if (session) {
						request.user = { id: session.user.id };
					} else {
						console.log("No valid session found");
					}

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
					const responseBody = await response.text();

					response.headers.forEach((value, key) => {
						reply.header(key, value);
					});

					reply.status(response.status);
					reply.send(responseBody || null);
				} catch (error) {
					console.error("Authentication Error:", error);
					reply.status(500).send({
						error: "Internal authentication error",
						code: "AUTH_FAILURE",
					});
				}
			},
		);

		await app.register(import("@fastify/websocket"));

		const wsSubscriptions = this.wsSubscriptions;

		await app.register(async function (fastify) {
			fastify.get("/ws", { websocket: true }, (socket: WebSocket, req) => {
				app.log.info({ readyState: socket.readyState }, "WS connected");

				try {
					socket.send(JSON.stringify({ type: "hello", ts: Date.now() }));
				} catch {
					// ignore
				}

				let isAlive = true;
				socket.on("pong", () => {
					isAlive = true;
				});

				const heartbeat = setInterval(() => {
					if ((socket as any).readyState !== (socket as any).OPEN) return;
					if (!isAlive) {
						try {
							(socket as any).terminate();
						} catch {
							// ignore
						}
						return;
					}
					isAlive = false;
					try {
						(socket as any).ping();
					} catch {
						// ignore
					}
				}, 30000);

				const subscribedGuilds = new Set<string>();

				const safeSend = (payload: unknown) => {
					if ((socket as any).readyState !== (socket as any).OPEN) return;
					try {
						socket.send(JSON.stringify(payload));
					} catch (err) {
						app.log.warn({ err }, "WS send failed");
					}
				};

				interface BaseMessage {
					type: string;
				}

				interface PingMessage extends BaseMessage {
					type: "ping";
				}

				interface SubscribeMessage extends BaseMessage {
					type: "subscribe";
					guildId: string;
				}

				interface UnsubscribeMessage extends BaseMessage {
					type: "unsubscribe";
					guildId: string;
				}

				interface IncomingMessageMap {
					ping: PingMessage;
					subscribe: SubscribeMessage;
					unsubscribe: UnsubscribeMessage;
				}

				type IncomingMessage =
					| IncomingMessageMap["ping"]
					| IncomingMessageMap["subscribe"]
					| IncomingMessageMap["unsubscribe"];

				function isIncomingMessage(msg: unknown): msg is IncomingMessage {
					if (typeof msg !== "object" || msg === null) return false;

					const m = msg as Record<string, unknown>;

					console.log("Received message", m);
					if (typeof m.type !== "string") return false;

					if (m.type === "ping") return true;

					return (
						(m.type === "subscribe" || m.type === "unsubscribe") &&
						typeof m.guildId === "string"
					);
				}
				socket.on("message", (raw) => {
					void (async () => {
						const text = Buffer.isBuffer(raw)
							? raw.toString("utf8")
							: raw instanceof ArrayBuffer
								? Buffer.from(raw).toString("utf8")
								: Array.isArray(raw)
									? Buffer.concat(raw).toString("utf8")
									: "";

						if (!text || text.length > 16_384) {
							return safeSend({ type: "error", error: "Payload too large" });
						}

						let parsed: unknown;
						try {
							parsed = JSON.parse(text);
						} catch {
							return safeSend({ type: "error", error: "Invalid JSON" });
						}
						if (!isIncomingMessage(parsed)) {
							return safeSend({
								type: "error",
								error: "Invalid message shape",
							});
						}

						const msg = parsed;
						if (msg.type === "ping") {
							return safeSend({ type: "pong" });
						}
						app.log.info(
							{ type: msg.type, guildId: msg.guildId },
							"WS message",
						);
						const guildId = String(msg?.guildId || "").trim();
						if (!guildId)
							return safeSend({ type: "error", error: "Missing guildId" });

						if (msg.type === "subscribe") {
							safeSend({ type: "subscribe_received", guildId });

							let set = wsSubscriptions.get(guildId);
							if (!set) {
								set = new Set<WebSocket>();
								wsSubscriptions.set(guildId, set);
							}

							set.add(socket);
							subscribedGuilds.add(guildId);

							app.log.info({ guildId, subs: set.size }, "WS subscribed");
							return safeSend({ type: "subscribed", guildId });
						}
						wsSubscriptions.get(guildId)?.delete(socket);
						subscribedGuilds.delete(guildId);
						app.log.info({ guildId }, "WS unsubscribed");
						return safeSend({ type: "unsubscribed", guildId });
					})();
				});

				socket.on("close", () => {
					app.log.info("WS closed");
					clearInterval(heartbeat);
					for (const guildId of subscribedGuilds) {
						wsSubscriptions.get(guildId)?.delete(socket);
					}
				});

				socket.on("error", (err: any) => {
					app.log.warn({ err }, "WS error");
				});
			});
		});

		try {
			await app.listen({
				port: Number(process.env.API_PORT),
				host: "0.0.0.0",
			});
			app.log.info(`[server] listening on ${app.server.address()}`);
			console.log("Routing", app.printRoutes());
		} catch (err) {
			app.log.error(err);
		}

		app.ready(() => {
			console.log("[Server] :: Dashboard routes loaded");
		});

		return app;
	}

	broadcastRadioUpdate(
		guildId: string,
		type: "radio_updated" | "recent_plays_updated" = "radio_updated",
	) {
		const sockets = this.wsSubscriptions.get(guildId);
		if (!sockets || sockets.size === 0) {
			this.app.log.info(
				{ guildId, type, subs: 0 },
				"WS radio broadcast skipped",
			);
			return;
		}
		this.app.log.info(
			{ guildId, type, subs: sockets.size },
			"WS radio broadcast",
		);
		const payload = JSON.stringify({ type, guildId, ts: Date.now() });
		for (const socket of sockets) {
			if (socket.readyState !== socket.OPEN) continue;
			try {
				socket.send(payload);
			} catch {
				// TODO: handle failed sends (cleanup dead sockets)
			}
		}
	}
}

export default DashboardServer;
