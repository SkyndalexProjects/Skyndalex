import {
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

export default async function guildSettingsRoute(fastify: FastifyInstance) {
	fastify.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
        console.log("[Server] :: Settings requested");

		const getBody = request.body as { guildId: string };
        const guildId = getBody.guildId;

        console.log("chuj", guildId)

        const getSettings = await request.client.prisma.settings.findMany({
            where: {
                guildId: guildId
            }
        });

        console.log("getSettings", getSettings)
	});
}