import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import autoLoad from "@fastify/autoload";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyFormBody from "@fastify/formbody";
import { fromNodeHeaders } from "better-auth/node";
import type { Guild, GuildMember } from "discord.js";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import type { WebSocket } from "ws";
import type { SkyndalexClient } from "#classes";
import { auth } from "../auth.js";

type RawData = WebSocket.RawData;

const MAX_WS_PAYLOAD_BYTES = 16_384;
const MAX_WS_MESSAGES_PER_MINUTE = 120;
const MAX_WS_SUBSCRIPTIONS = 100;
const WS_HEARTBEAT_INTERVAL_MS = 30_000;
const DISCORD_SNOWFLAKE = /^\d{17,20}$/;

const DEFAULT_ALLOWED_ORIGINS = [
	"https://beta.skyndalex.com",
	"https://skyndalex.com",
	"https://api.skyndalex.com",
] as const;

type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>;
type AuthenticatedSession = NonNullable<SessionData>;

type GuildSubscriptionAuthorizer = (context: {
	client: SkyndalexClient;
	guildId: string;
	session: AuthenticatedSession;
}) => boolean | Promise<boolean>;

export interface DashboardServerOptions {
	authorizeGuildSubscription?: GuildSubscriptionAuthorizer;
	publicOrigin?: string;
}

declare module "fastify" {
	interface FastifyRequest {
		client: SkyndalexClient;
		user?: { id: string };
		session?: SessionData;
		guild?: Guild;
		member?: GuildMember;
	}
}

function parsePort(value: string | undefined): number {
	const port = Number(value);
	if (!Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new Error("API_PORT must be an integer between 1 and 65535");
	}
	return port;
}

function normalizeOrigin(value: string): string {
	const url = new URL(value);
	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error(`Unsupported origin protocol: ${url.protocol}`);
	}
	return url.origin;
}

function tryNormalizeOrigin(value: string | undefined): string | undefined {
	if (!value) return undefined;
	try {
		return normalizeOrigin(value);
	} catch {
		return undefined;
	}
}

function buildAllowedOrigins(publicOrigin: string): Set<string> {
	const values = [
		process.env.FRONTEND_URL,
		process.env.FRONTEND_DEV,
		publicOrigin,
		...DEFAULT_ALLOWED_ORIGINS,
	];

	const origins = new Set<string>();
	for (const value of values) {
		if (!value) continue;
		origins.add(normalizeOrigin(value));
	}
	return origins;
}

function getCookieSecret(): string {
	const secret = process.env.COOKIE_SECRET ?? process.env.BETTER_AUTH_SECRET;
	if (!secret || secret.length < 20) {
		throw new Error(
			"COOKIE_SECRET or BETTER_AUTH_SECRET must be configured with at least 20 characters",
		);
	}
	return secret;
}

function isAuthRequest(url: string): boolean {
	const pathname = url.split("?", 1)[0];
	return pathname === "/auth" || pathname.startsWith("/auth/");
}

function rawDataByteLength(raw: RawData): number {
	if (Buffer.isBuffer(raw)) return raw.byteLength;
	if (raw instanceof ArrayBuffer) return raw.byteLength;

	let total = 0;
	for (const chunk of raw) total += chunk.byteLength;
	return total;
}

function rawDataToUtf8(raw: RawData): string {
	if (Buffer.isBuffer(raw)) return raw.toString("utf8");
	if (raw instanceof ArrayBuffer) return Buffer.from(raw).toString("utf8");
	return Buffer.concat(raw).toString("utf8");
}

function copyFetchResponseHeaders(reply: FastifyReply, headers: Headers): void {
	const headersWithSetCookie = headers as Headers & {
		getSetCookie?: () => string[];
	};

	const setCookies = headersWithSetCookie.getSetCookie?.() ?? [];

	headers.forEach((value, key) => {
		if (key.toLowerCase() !== "set-cookie") {
			reply.header(key, value);
		}
	});

	if (setCookies.length > 0) {
		reply.header("set-cookie", setCookies);
		return;
	}

	const fallbackSetCookie = headers.get("set-cookie");

	if (fallbackSetCookie) {
		reply.header("set-cookie", fallbackSetCookie);
	}
}
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

type IncomingMessage = PingMessage | SubscribeMessage | UnsubscribeMessage;

function isIncomingMessage(message: unknown): message is IncomingMessage {
	if (typeof message !== "object" || message === null) return false;

	const value = message as Record<string, unknown>;
	if (value.type === "ping") return true;

	return (
		(value.type === "subscribe" || value.type === "unsubscribe") &&
		typeof value.guildId === "string"
	);
}

export class DashboardServer {
	readonly app: Fastify.FastifyInstance;
	readonly client: SkyndalexClient;
	readonly wsSubscriptions = new Map<string, Set<WebSocket>>();

	private readonly authorizeGuildSubscription: GuildSubscriptionAuthorizer;
	private readonly publicOrigin: string;
	private readonly apiPort: number;

	constructor(
		client: SkyndalexClient,
		options: DashboardServerOptions = {},
	) {
		this.client = client;

		this.authorizeGuildSubscription =
			options.authorizeGuildSubscription ??
			(() => false);

		this.apiPort = parsePort(process.env.API_PORT);

		const configuredOrigin =
			options.publicOrigin ??
			process.env.API_PUBLIC_URL ??
			process.env.BETTER_AUTH_URL;

		if (!configuredOrigin && process.env.NODE_ENV === "production") {
			throw new Error(
				"publicOrigin, API_PUBLIC_URL, or BETTER_AUTH_URL is required in production",
			);
		}

		this.publicOrigin = normalizeOrigin(
			configuredOrigin ?? `http://127.0.0.1:${this.apiPort}`,
		);

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
			trustProxy: process.env.TRUST_PROXY ?? "127.0.0.1",
		});
	}

	async init(): Promise<Fastify.FastifyInstance> {
		const app = this.app;
		const isProduction = process.env.NODE_ENV === "production";
		const allowedOrigins = buildAllowedOrigins(this.publicOrigin);

		await app.register(fastifyCors, {
			origin: [...allowedOrigins],
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
			preflightContinue: false,
			optionsSuccessStatus: 204,
		});

		await app.register(fastifyCookie, {
			secret: getCookieSecret(),
			parseOptions: {
				secure: isProduction,
				sameSite: "lax",
				httpOnly: true,
			},
		});

		await app.register(import("@fastify/rate-limit"), {
			max: 100,
			timeWindow: "1 minute",
		});

		await app.register(import("@fastify/websocket"), {
			options: {
				maxPayload: MAX_WS_PAYLOAD_BYTES,
				perMessageDeflate: false,
			},
		});

		await app.register(fastifyFormBody);

		app.addHook("preHandler", (request: FastifyRequest) => {
			request.client = this.client;
		});

		app.addHook("preHandler", (request, reply) => {
			if (request.method === "OPTIONS") return;

			const rawOrigin = request.headers.origin;
			if (!rawOrigin) return;

			const origin = tryNormalizeOrigin(rawOrigin);
			if (!origin || !allowedOrigins.has(origin)) {
				app.log.warn({ origin: rawOrigin }, "Blocked origin");
				return reply.code(403).send({ error: "Forbidden" });
			}
		});

		app.addHook(
			"preHandler",
			async (request: FastifyRequest, reply: FastifyReply) => {
				if (!isAuthRequest(request.url)) return;

				try {
					const url = new URL(request.url, this.publicOrigin);
					const headers = fromNodeHeaders(request.headers);
					const hasBody =
						request.body !== undefined &&
						request.body !== null &&
						request.method !== "GET" &&
						request.method !== "HEAD";

					const authRequest = new Request(url, {
						method: request.method,
						headers,
						body: hasBody ? JSON.stringify(request.body) : undefined,
					});

					const response = await auth.handler(authRequest);
					const responseBody = response.body ? await response.text() : null;

					copyFetchResponseHeaders(reply, response.headers);
					return reply.status(response.status).send(responseBody);
				} catch (error) {
					app.log.error({ err: error }, "Authentication error");
					return reply.status(500).send({
						error: "Internal authentication error",
						code: "AUTH_FAILURE",
					});
				}
			},
		);

		const wsSubscriptions = this.wsSubscriptions;

		await app.register(async (fastify) => {
			fastify.get(
				"/ws",
				{
					websocket: true,
					preValidation: async (request, reply) => {
						const rawOrigin = request.headers.origin;
						const origin = tryNormalizeOrigin(rawOrigin);

						if (!origin || !allowedOrigins.has(origin)) {
							return reply.code(403).send({ error: "Forbidden" });
						}

						const session = await auth.api.getSession({
							headers: fromNodeHeaders(request.headers),
						});

						if (!session) {
							return reply.code(401).send({ error: "Unauthorized" });
						}

						request.session = session;
						request.user = { id: session.user.id };
					},
				},
				(socket: WebSocket, request: FastifyRequest) => {
					const session = request.session;
					if (!session) {
						socket.close(1008, "Unauthorized");
						return;
					}

					app.log.info(
						{ readyState: socket.readyState, userId: session.user.id },
						"WS connected",
					);

					const subscribedGuilds = new Set<string>();
					let isAlive = true;
					let messageWindowStartedAt = Date.now();
					let messagesInWindow = 0;
					let closedForRateLimit = false;
					let messageQueue = Promise.resolve();

					const removeSubscription = (guildId: string): void => {
						const sockets = wsSubscriptions.get(guildId);
						if (!sockets) return;

						sockets.delete(socket);
						if (sockets.size === 0) wsSubscriptions.delete(guildId);
					};

					const cleanup = (): void => {
						clearInterval(heartbeat);
						for (const guildId of subscribedGuilds) {
							removeSubscription(guildId);
						}
						subscribedGuilds.clear();
					};

					const safeSend = (payload: unknown): void => {
						if (socket.readyState !== socket.OPEN) return;
						try {
							socket.send(JSON.stringify(payload));
						} catch (error) {
							app.log.warn({ err: error }, "WS send failed");
						}
					};

					const isMessageRateLimited = (): boolean => {
						const now = Date.now();
						if (now - messageWindowStartedAt >= 60_000) {
							messageWindowStartedAt = now;
							messagesInWindow = 0;
						}

						messagesInWindow += 1;
						return messagesInWindow > MAX_WS_MESSAGES_PER_MINUTE;
					};

					const handleMessage = async (raw: RawData): Promise<void> => {
						const text = rawDataToUtf8(raw);
						if (!text) {
							safeSend({ type: "error", error: "Empty payload" });
							return;
						}

						let parsed: unknown;
						try {
							parsed = JSON.parse(text);
						} catch {
							safeSend({ type: "error", error: "Invalid JSON" });
							return;
						}

						if (!isIncomingMessage(parsed)) {
							safeSend({ type: "error", error: "Invalid message shape" });
							return;
						}

						if (parsed.type === "ping") {
							safeSend({ type: "pong" });
							return;
						}

						const guildId = parsed.guildId.trim();
						if (!DISCORD_SNOWFLAKE.test(guildId)) {
							safeSend({ type: "error", error: "Invalid guildId" });
							return;
						}

						if (parsed.type === "unsubscribe") {
							removeSubscription(guildId);
							subscribedGuilds.delete(guildId);
							safeSend({ type: "unsubscribed", guildId });
							return;
						}

						if (subscribedGuilds.has(guildId)) {
							safeSend({ type: "subscribed", guildId });
							return;
						}

						if (subscribedGuilds.size >= MAX_WS_SUBSCRIPTIONS) {
							safeSend({
								type: "error",
								error: "Subscription limit reached",
							});
							return;
						}

						let authorized = false;
						try {
							authorized = await this.authorizeGuildSubscription({
								client: this.client,
								guildId,
								session,
							});
						} catch (error) {
							app.log.warn(
								{ err: error, guildId, userId: session.user.id },
								"Guild subscription authorization failed",
							);
							safeSend({ type: "error", error: "Authorization failed" });
							return;
						}

						if (!authorized) {
							app.log.warn(
								{ guildId, userId: session.user.id },
								"WS guild subscription denied",
							);
							safeSend({ type: "error", error: "Forbidden" });
							return;
						}

						let sockets = wsSubscriptions.get(guildId);
						if (!sockets) {
							sockets = new Set<WebSocket>();
							wsSubscriptions.set(guildId, sockets);
						}

						sockets.add(socket);
						subscribedGuilds.add(guildId);
						app.log.info({ guildId, subs: sockets.size }, "WS subscribed");
						safeSend({ type: "subscribed", guildId });
					};

					socket.on("pong", () => {
						isAlive = true;
					});

					const heartbeat = setInterval(() => {
						if (socket.readyState !== socket.OPEN) return;

						if (!isAlive) {
							socket.terminate();
							return;
						}

						isAlive = false;
						try {
							socket.ping();
						} catch (error) {
							app.log.warn({ err: error }, "WS ping failed");
						}
					}, WS_HEARTBEAT_INTERVAL_MS);

					socket.on("message", (raw: RawData) => {
						if (rawDataByteLength(raw) > MAX_WS_PAYLOAD_BYTES) {
							safeSend({ type: "error", error: "Payload too large" });
							socket.close(1009, "Payload too large");
							return;
						}

						if (isMessageRateLimited()) {
							if (!closedForRateLimit) {
								closedForRateLimit = true;
								safeSend({ type: "error", error: "Rate limit exceeded" });
								socket.close(1008, "Rate limit exceeded");
							}
							return;
						}

						messageQueue = messageQueue
							.then(() => handleMessage(raw))
							.catch((error) => {
								app.log.warn({ err: error }, "WS message handler failed");
								safeSend({ type: "error", error: "Internal error" });
							});
					});

					socket.on("close", () => {
						cleanup();
						app.log.info({ userId: session.user.id }, "WS closed");
					});

					socket.on("error", (error: Error) => {
						app.log.warn({ err: error }, "WS error");
					});

					safeSend({ type: "hello", ts: Date.now() });
				},
			);
		});

		const __filename = fileURLToPath(import.meta.url);
		const __dirname = dirname(__filename);

		await app.register(autoLoad, {
			dir: path.join(__dirname, "../dashboard/routes"),
			routeParams: true,
		});

		await app.listen({
			port: this.apiPort,
			host: "127.0.0.1",
		});

		app.log.info(
			{ address: app.server.address() },
			"[server] Dashboard server listening",
		);

		if (!isProduction) {
			app.log.debug({ routes: app.printRoutes() }, "Dashboard routes loaded");
		}

		return app;
	}

	broadcastRadioUpdate(
		guildId: string,
		type: "radio_updated" | "recent_plays_updated" = "radio_updated",
	): void {
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
		for (const socket of [...sockets]) {
			if (socket.readyState !== socket.OPEN) {
				sockets.delete(socket);
				continue;
			}

			try {
				socket.send(payload);
			} catch (error) {
				sockets.delete(socket);
				this.app.log.warn({ err: error, guildId }, "WS broadcast failed");
			}
		}

		if (sockets.size === 0) this.wsSubscriptions.delete(guildId);
	}
}

export default DashboardServer;
