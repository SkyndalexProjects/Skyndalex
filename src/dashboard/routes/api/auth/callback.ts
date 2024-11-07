import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { DiscordOauthResponse } from "#types";

async function authCallback(fastify: FastifyInstance) {
    fastify.get(
        "/",
        async (request: FastifyRequest, reply: FastifyReply) => {
            const query = request.query as { code?: string };

            if (!query.code) {
                return reply.send("No code provided");
            }

            const params = new URLSearchParams();
            params.set("grant_type", "authorization_code");
            params.set("code", query.code);
            params.set("redirect_uri", "http://localhost:3000/api/auth/callback");

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

            const cookies = request.cookies;
            if (!cookies.token) {
                reply.setCookie("token", token.access_token, {
                    domain: "localhost",
                    path: "/",
                })
            }

            reply.redirect("http://localhost:5173");
        },
    );
}

export default authCallback;
