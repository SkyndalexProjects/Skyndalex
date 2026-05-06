import {
    PermissionFlagsBits,
} from "discord.js";
import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { requireGuildPermission } from "../../../../middleware/auth.js";

export default async function roles(fastify: FastifyInstance) {
    fastify.get(
        "/roles",
        { preHandler: requireGuildPermission },
        async (
            request: FastifyRequest<{ Params: { id: string } }>,
            reply: FastifyReply,
        ) => {
            console.log("[Server] :: Roles requested");

            const { guild, member } = request;

            const getRoles = guild!.roles.cache
                .filter((role) => {
                    return member!.permissions.has(PermissionFlagsBits.ManageRoles) || role.id === guild!.id;
                })
                .map((role) => ({
                    id: role.id,
                    name: role.name,
                    color: role.hexColor,
                    position: role.position,
                    managed: role.managed,
                    mentionable: role.mentionable,
                    guildId: guild!.id,
                }));
            if (!getRoles || getRoles.length === 0) {
                return reply
                    .status(404)
                    .send({ error: "No roles found in the guild" });
            }

            if (
                !getRoles.every(
                    (role: { id: string; name: string }) =>
                        role.id && role.name,
                )
            ) {
                return reply.status(500).send({ error: "Invalid role data" });
            }

            return getRoles;
        },
    );
}
