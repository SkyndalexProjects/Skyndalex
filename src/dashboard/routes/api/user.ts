import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../../auth.js";
import type { DiscordUser } from "#types";
import console from "node:console";
export default async function userRoutes(fastify: FastifyInstance) {
	fastify.get("/user", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            console.log("Request.headers /user endpoint", request.headers);
            // Get reply headers
            console.log("Reply.headers /user endpoint", reply.getHeaders());
            const session = await auth.api.getSession({ headers: reply.getHeaders() });

            console.log("user session:", session);
            if (!session) {
                reply.status(401).send({ error: "Unauthorized" });
                return;
            }

            const { accessToken } = await auth.api.getAccessToken({
                body: {
                    providerId: "discord",
                    userId: session.session.userId,
                },
                headers: request.headers,
            });
            const response = await fetch("https://discord.com/api/users/@me", {
                headers: {
                    authorization: `Bearer ${accessToken}`,
                },
            });

            const user = (await response.json()) as DiscordUser;
            reply.send(user);
        } catch (error) {
            console.error("Error fetching user data:", error);
            reply.status(500).send({ error: "Something went wrong" });
        }
	});
}
