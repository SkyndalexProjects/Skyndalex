import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { DiscordUser } from "../types/index.js";

const prisma = new PrismaClient();

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	socialProviders: {
		discord: {
			clientId: process.env.CLIENT_ID as string,
			clientSecret: process.env.CLIENT_SECRET as string,
			getUserInfo: async (tokens) => {
				const req = await fetch("https://discord.com/api/users/@me", {
					headers: {
						Authorization: `Bearer ${tokens.accessToken}`,
					},
				});

				const json = (await req.json()) as DiscordUser;

				return {
					user: {
						name: json.username,
						email: json.email,
						image: json.avatar
							? `https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}.png`
							: undefined,
						emailVerified: true,
						id: json.id,
						discordId: json.id,
					},
					data: json,
				};
			},
		},
	},
	user: {
		additionalFields: {
			discordId: {
				type: "string",
				unique: true,
				required: true,
			},
		},
	},
	advanced: {
		useSecureCookies: false,
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	cors: {
		origin: [process.env.FRONTEND_URL as string],
		credentials: true,
	},
	basePath: "/api/auth",
	baseURL: `${process.env.API_ENDPOINT}:${process.env.API_PORT}`,
	trustedOrigins: [process.env.FRONTEND_URL as string],
});
