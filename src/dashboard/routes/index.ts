import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { DiscordUser } from "#types";
import { auth } from "../../auth.js";

const SESSION_COOKIE_NAMES = [
	"__Secure-session_token",
	"skyndalex_session_token",
	"session_token",
] as const;

function getSessionToken(request: FastifyRequest): string | null {
	const cookies = (request as { cookies?: Record<string, unknown> }).cookies;
	for (const name of SESSION_COOKIE_NAMES) {
		const token = cookies?.[name];
		if (typeof token === "string" && token.length > 0) {
			return token;
		}
	}

	return null;
}

function isValidDiscordUser(value: unknown): value is DiscordUser {
	if (!value || typeof value !== "object") {
		return false;
	}

	const maybeUser = value as { id?: unknown; username?: unknown };
	return (
		typeof maybeUser.id === "string" &&
		maybeUser.id.length > 0 &&
		typeof maybeUser.username === "string"
	);
}

export default async function index(fastify: FastifyInstance) {
	fastify.get("/", async (req: FastifyRequest, reply: FastifyReply) => {
		const sessionToken = getSessionToken(req);
		if (sessionToken) {
			const cachedJson = await req.client.redis.get(
				`session:${sessionToken}:user`,
			);
			if (cachedJson) {
				try {
					const cachedUser = JSON.parse(cachedJson) as unknown;
					if (isValidDiscordUser(cachedUser)) {
						return reply.redirect(
							`${process.env.FRONTEND_URL}/dashboard/guild`,
						);
					}
				} catch {
					// ignore invalid cache
				}
			}
		}

		const session = await auth.api.getSession({
			headers: req.headers,
		});

		if (!session) {
			return reply.redirect(`${process.env.OAUTH_URL}`);
		}

		reply.redirect(`${process.env.FRONTEND_URL}/dashboard/guild`);
	});
}
