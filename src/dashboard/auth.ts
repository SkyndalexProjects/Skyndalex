import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { DiscordUser } from "../types/index.js";

const prisma = new PrismaClient();
const REQUIRED_GUILD_ID = "1058882286210261073"; // "skyndalex"
const REQUIRED_ROLE_ID = "1059077097945051237"; // "support"

interface DiscordGuildMember {
    user: {
        id: string;
        username: string;
    };
    roles: string[];
    nick?: string;
}
export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	socialProviders: {
		discord: {
			clientId: process.env.CLIENT_ID as string,
			clientSecret: process.env.CLIENT_SECRET as string,
            disableDefaultScope: true,
            scope: ["identify", "guilds", "guilds.members.read"],
            getUserInfo: async (tokens) => {
				const req = await fetch("https://discord.com/api/users/@me", {
					headers: {
						Authorization: `Bearer ${tokens.accessToken}`,
					},
				});

				const json = (await req.json()) as DiscordUser;
                const guildMemberReq = await fetch(
                    `https://discord.com/api/users/@me/guilds/${REQUIRED_GUILD_ID}/member`,
                    {
                        headers: {
                            Authorization: `Bearer ${tokens.accessToken}`,
                        },
                    }
                );
                const guildMember = await guildMemberReq.json() as DiscordGuildMember

                if (!guildMember.roles.includes(REQUIRED_ROLE_ID)) {
                    throw new Error("User does not have the required role");
                }

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
		useSecureCookies: true,
        crossSubDomainCookies: {
            enabled: true,
            domain: process.env.OAUTH_DOMAIN as string,
        },
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 15 * 60,
		},
	},
	cors: {
        origin: [
            process.env.FRONTEND_URL as string,
            'https://beta.skyndalex.com',
            'https://skyndalex.com',
            'https://api.skyndalex.com'
        ],
		credentials: true,
	},
	basePath: "/auth",
	baseURL: process.env.FRONTEND_URL as string,
	trustedOrigins: [
        process.env.FRONTEND_URL as string,
        'https://beta.skyndalex.com',
        'https://skyndalex.com',
        'https://api.skyndalex.com'
    ]
});
