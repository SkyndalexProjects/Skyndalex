import Fastify, {
	FastifyRequest,
	FastifyReply,
	FastifyInstance,
} from "fastify";

interface Guild {
	id: string;
	name: string;
	icon: string;
	owner: boolean;
	permissions: string;
}

export default async function guildsRoute(fastify: FastifyInstance) {
	fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
		const token = request.cookies.token;
		console.log("[Server] :: Guilds requested");

		const response = await fetch(
			"https://discord.com/api/users/@me/guilds",
			{
				headers: {
					authorization: `Bearer ${token}`,
				},
			},
		);

		const guilds = (await response.json()) as Guild[];
		const filteredGuilds = guilds.filter((guild) => {
			const permissions = BigInt(guild.permissions);
			const hasPermission = (permissions & BigInt(0x20)) === BigInt(0x20);
			return hasPermission;
		});
		reply.send(filteredGuilds);
		return;
	});
}
