import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { request } from "express";
import * as console from "node:console";

interface Guild {
	id: string;
	name: string;
	icon?: string;
	owner: boolean;
	permissions: string;
}

export default async function guildsRoute(fastify: FastifyInstance) {
	fastify.get(
		"/guilds",
		async (request: FastifyRequest, reply: FastifyReply) => {
			const token = request.cookies.token;
			console.log("[Server] :: Guilds requested");

			const response = await fetch("https://discord.com/api/users/@me/guilds", {
				headers: {
					authorization: `Bearer ${token}`,
				},
			});
			console.log("res.status", response.status);

			if (!response.ok) {
				reply.status(response.status).send({
					error: "Failed to fetch guilds",
				});
				return;
			}

			const guildsAPI = await response.json();
			console.log("guildsAPI", guildsAPI);
			if (!Array.isArray(guildsAPI)) {
				return reply.status(500).send({ error: "Invalid guilds response" });
			}

			const detailedGuilds = guildsAPI.map((guild: Guild) => ({
				...guild,
				isBotAdded: request.client.guilds.cache.has(guild.id),
			}));

			return reply.status(200).send(detailedGuilds);
		},
	);
	fastify.get(
		`/guild`,
		async (request: FastifyRequest, reply: FastifyReply) => {
			console.log("[Server] :: Guild requested");
			const token = request.cookies?.token;
			const guildId = request.headers.guildid as string | undefined;

			console.log("guildId", guildId);
			if (!token) {
				reply.status(401).send({ error: "No token" });
				return;
			}

			// @ts-ignore
			const guild = request.client.guilds.cache.get(guildId);

			reply.send(guild);
			return;
		},
	);
}
