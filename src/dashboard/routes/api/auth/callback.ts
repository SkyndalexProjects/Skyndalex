import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { DiscordOauthResponse, DiscordUser } from "#types";
export default async function callbackRoute(fastify: FastifyInstance) {
	fastify.get(
		"/callback",
		async (
			request: FastifyRequest<{ Querystring: { code: string } }>,
			reply: FastifyReply,
		) => {
			if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
				throw new Error(
					"CLIENT_ID or CLIENT_SECRET is not defined in environment variables",
				);
			}

			const params = new URLSearchParams({
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET,
				code: request.query.code,
				grant_type: "authorization_code",
				redirect_uri: "http://localhost:3000/api/auth/callback",
			});

			const response = await fetch(
				"https://discord.com/api/oauth2/token",
				{
					method: "POST",
					body: params.toString(),
					headers: {
						authorization: `Basic ${Buffer.from(
							`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`,
						).toString("base64")}`,
						"Content-Type": "application/x-www-form-urlencoded",
					},
				},
			);

			const token = (await response.json()) as DiscordOauthResponse;

			const getUserData = await fetch(
				"https://discord.com/api/users/@me",
				{
					headers: {
						authorization: `Bearer ${token.access_token}`,
					},
				},
			);
			const userData = (await getUserData.json()) as DiscordUser;

			const existingUser = await request.client.prisma.users.findUnique({
				where: {
					userId: userData.id,
				},
			});

			if (!existingUser) {
				await request.client.prisma.users.create({
					data: {
						type: "normal",
						userId: userData.id,
						username: userData.username,
						avatar: userData.avatar ?? "default-avatar",
						usedCommand: false,
					},
				});
			}
			const cookies = request.cookies;
			if (!cookies.token) {
				// set token available also for localhost:5173

				reply.setCookie("token", token.access_token, {
					domain: "localhost",
					path: "/",
					secure: false,
					httpOnly: false,
				});
			}
			reply.redirect("http://localhost:5173/");
		},
	);
}
