import {
	FastifyRequest,
	FastifyReply,
	FastifyInstance,
} from "fastify";

export default async function guildSettingsRoute(fastify: FastifyInstance) {
	fastify.post("/channels", async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        console.log("[Server] :: Settings requested");
		const getId = request.params.id;


        const getChannels = request.client.guilds.cache.get(getId)?.channels.cache.map((channel) => {
            return {
                id: channel.id,
                name: channel.name,
                type: channel.type,
                guildId: getId
            }
        });

        console.log("getChannels", getChannels)
        if (!getChannels) {
            reply.status(404).send({ error: "Channels not found" });
            return;
        }

		return getChannels;
	});
}