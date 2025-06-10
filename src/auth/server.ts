import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import fastifyFlash from "@fastify/flash";
import fastifyFormBody from "@fastify/formbody";
import type { SkyndalexClient } from "#classes";
import * as process from "node:process";
import { DiscordOauthResponse, DiscordUser } from "../types/index.js";

declare module "fastify" {
	interface FastifyRequest {
		client: SkyndalexClient;
	}
}
declare module "@fastify/session" {
	interface FastifySessionObject {
		userId: string;
	}
}
export class AuthServer {
	app: Fastify.FastifyInstance;
	client: SkyndalexClient;

	constructor(client: SkyndalexClient) {
		this.client = client;
		this.app = Fastify();
	}

	async init() {
		const app = this.app;

		app.register(fastifyCookie);
		app.register(fastifySession, {
			secret: process.env.HF_APP_SECRET || "defaultsecret",
			cookie: {
				httpOnly: true,
				maxAge: 7 * 24 * 60 * 60 * 1000,
			},
			saveUninitialized: true,
			cookieName: "sessionId",
		});
		app.register(fastifyFlash);
		app.register(fastifyFormBody);

		app.addHook("preHandler", async (request: FastifyRequest) => {
			request.client = this.client;
			if (!request.session.userId) {
				request.session.userId = "";
			}
		});

		this.setupRoutes();

		try {
			await app.listen({ port: 2137, host: "0.0.0.0" });
		} catch (err) {
			app.log.error(err);
		}

		app.ready(() => {
			console.log(app.printRoutes());
		});

		return app;
	}

	setupRoutes() {
		const app = this.app;
		const client = this.client;
		app.get(
			"/discord/callback",
			async (
				request: FastifyRequest<{
					Querystring: { code: string };
				}>,
				reply: FastifyReply,
			): Promise<void> => {
				const params = new URLSearchParams();
				params.append("client_id", process.env.CLIENT_ID || "");
				params.append("client_secret", process.env.CLIENT_SECRET || "");
				params.append("code", request.query.code);
				params.append("grant_type", "authorization_code");
				params.append("redirect_uri", "http://localhost:2137/discord/callback");

				console.log("Now at discord callback");
				const { code } = request.query as { code: string };
				if (!code) {
					return reply.status(400).send({ error: "No authorization code." });
				}

				const response = await fetch("https://discord.com/api/oauth2/token", {
					method: "POST",
					body: params.toString(),
					headers: {
						authorization: `Basic ${Buffer.from(
							`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`,
						).toString("base64")}`,
						"Content-Type": "application/x-www-form-urlencoded",
					},
				});

				const token = (await response.json()) as DiscordOauthResponse;

				const getUserData = await fetch("https://discord.com/api/users/@me", {
					headers: {
						authorization: `Bearer ${token.access_token}`,
					},
				});
				const userData = (await getUserData.json()) as DiscordUser;

				console.log("userData", userData);
				request.session.userId = userData.id;
				await request.session.save();
				return reply.redirect(
					process.env.HF_APP_AUTH_URL ?? "https://default-auth-url.com",
				);
			},
		);
		app.get("/huggingface/callback", async (request, reply) => {
			console.log("Now at huggingface");
			const { code } = request.query as { code: string };
			const userId = request.session.userId;
			console.log("userId huggingface", userId);
			if (!code) {
				return reply.status(400).send({ error: "No authorization code." });
			}

			if (!userId) {
				return reply.status(400).send({ error: "Session expired. " });
			}

			const huggingfaceData = await fetch(
				"https://huggingface.co/oauth/token",
				{
					method: "POST",
					body: new URLSearchParams({
						client_id: process.env.HF_CLIENT_ID || "",
						client_secret: process.env.HF_APP_SECRET || "",
						code,
						grant_type: "authorization_code",
						redirect_uri: "http://localhost:2137/huggingface/callback",
					}),
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",
					},
				},
			);
			const data = (await huggingfaceData.json()) as { access_token: string };
			console.log("data", data);
			try {
				const token = await client.prisma.tokens.upsert({
					where: {
						userId: userId,
					},
					update: {
						huggingFaceToken: data?.access_token,
					},
					create: {
						userId: userId,
						huggingFaceToken: data?.access_token,
					},
				});

				reply.status(200).send({
					message: "Token created successfully.",
					token,
				});
				request.flash("success", "Token successfully created.");
			} catch (error) {
				console.error(error);
				request.flash("error", "Failed to create token.");
			}
		});
	}
}

export default AuthServer;
