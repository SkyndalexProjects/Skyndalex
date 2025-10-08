import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	socialProviders: {
		discord: {
			clientId: process.env.CLIENT_ID as string,
			clientSecret: process.env.CLIENT_SECRET as string,
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
		origin: ["http://localhost:5173"],
		credentials: true,
	},
	basePath: "/api/auth",
	baseURL: "http://localhost:3000",
	trustedOrigins: ["http://localhost:5173"],
});
