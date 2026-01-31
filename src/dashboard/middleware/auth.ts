import { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../../auth.js";

export async function requireGuildPermission(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
        return reply.status(401).send({ error: "Unauthorized" });
    }

    const guildId = request.params.id;
    const guild = request.client.guilds.cache.get(guildId);

    if (!guild) {
        return reply.status(404).send({ error: "Guild not found" });
    }

    if (!session.user.discordId) {
        return reply.status(400).send({ error: "Discord account not found" });
    }

    const member = await guild.members
        .fetch(session.user.discordId)
        .catch(() => null);


    if (!member) {
        return reply.status(404).send({ error: "Member not found" });
    }

    if (!member.permissions.has("ManageGuild")) {
        return reply.status(403).send({ error: "Forbidden" });
    }

    request.session = session;
    request.guild = guild;
    request.member = member;
}
