import { ChannelType, PermissionFlagsBits } from "discord.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { auth } from "../../../../auth.js";
import type { DiscordUser } from "#types";

export default async function channels(fastify: FastifyInstance) {
    fastify.get(
        "/channels",
        async (
            request: FastifyRequest<{ Params: { id: string } }>,
            reply: FastifyReply,
        ) => {
            console.log("[Server] :: Settings requested");
            const session = await auth.api.getSession({ headers: request.headers });
            if (!session) {
                reply.status(401).send({ error: "Unauthorized" });
                return;
            }
            const guildId = request.params.id;
            const guild = request.client.guilds.cache.get(guildId);

            const member = await guild?.members.fetch(session?.user.discordId);
            if (!member?.permissions.has('ManageGuild')) {
                return reply.status(403).send({ error: "Forbidden"});
            }
            const getChannels = guild?.channels.cache
                .filter((ch) => {
                    const permissions = ch.permissionsFor(member);
                    return (
                        permissions && permissions.has(PermissionFlagsBits.ViewChannel)
                    );
                })
                .map((ch) => {
                    return {
                        id: ch.id,
                        name: ch.name,
                        type: ChannelType[ch.type],
                        guildId: guild.id,
                    };
                });

            if (!getChannels || Array.from(getChannels).length === 0) {
                reply.status(404).send({ error: "No channels found in the guild" });
                return;
            }

            if (!getChannels.every((ch) => ch.id && ch.name && ch.type)) {
                reply.status(500).send({ error: "Invalid channel data" });
                return;
            }

            return getChannels;
        },
    );
}