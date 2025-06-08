import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";

interface Guild {
	id: string;
	name: string;
	icon: string;
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
			if (!response.ok) {
				reply.status(response.status).send({
					error: "Failed to fetch guilds",
					message: await response.text(),
				});
				return;
			}

			const guilds = (await response.json()) as Guild[];

			if (!Array.isArray(guilds)) {
				reply.status(500).send({ error: "Invalid guilds response" });
				return;
			}
			const botGuildsResponse = await fetch(
				"https://discord.com/api/users/@me/guilds",
				{
					headers: {
						authorization: `Bot ${process.env.BOT_TOKEN}`,
					},
				},
			);

			if (!botGuildsResponse.ok) {
				reply.status(botGuildsResponse.status).send({
					error: "Failed to fetch bot guilds",
					message: await botGuildsResponse.text(),
				});
				return;
			}

			const botGuilds = (await botGuildsResponse.json()) as Guild[];
			const botGuildIds = new Set(botGuilds.map((guild) => guild.id));

			const guildsWithMoreUserData = guilds.map((guild: Guild) => ({
				...guild,
				isBotAdded: botGuildIds.has(guild.id),
			}));

			reply.send(guildsWithMoreUserData);
			return;
		},
	);
}
