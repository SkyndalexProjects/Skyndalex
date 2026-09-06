import type { GuildMember } from "discord.js";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { RedisClientType } from "redis";
import { auth } from "../../../auth.js";

const CACHE_DURATION = 300;

interface DiscordGuild {
	id: string;
	name: string;
	icon: string | null;
	owner?: boolean;
	permissions?: string;
	ownerId?: string;
	memberCount?: number;
}

interface DiscordUser {
	id: string;
}

interface SerializedGuildList {
	id: string;
	name: string;
	icon: string | null;
	isBotAdded: boolean;
	approximate_member_count: number;
	owner: boolean;
	permissions: string;
}

interface SerializedGuildDetail {
	id: string;
	name: string;
	icon: string | null;
	ownerId: string;
	memberCount: number;
}

const Validator = {
	guildId(data: unknown): data is string {
		return typeof data === "string" && /^\d{15,21}$/.test(data);
	},

	token(data: unknown): data is string {
		return typeof data === "string" && data.length > 0;
	},

	discordUser(data: unknown): data is DiscordUser {
		return (
			typeof data === "object" &&
			data !== null &&
			typeof (data as Record<string, unknown>).id === "string"
		);
	},

	guildArray(data: unknown): data is DiscordGuild[] {
		if (!Array.isArray(data)) {
			return false;
		}

		return data.every((guild) => {
			if (typeof guild !== "object" || guild === null) {
				return false;
			}

			const value = guild as Record<string, unknown>;

			return (
				typeof value.id === "string" &&
				typeof value.name === "string" &&
				(value.icon === null || typeof value.icon === "string") &&
				(value.owner === undefined || typeof value.owner === "boolean") &&
				(value.permissions === undefined ||
					typeof value.permissions === "string")
			);
		});
	},
};

const Serializer = {
	guildList(
		guild: DiscordGuild,
		isBotAdded: boolean,
		memberCount: number,
	): SerializedGuildList {
		return {
			id: guild.id,
			name: guild.name,
			icon: guild.icon
				? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
				: null,
			isBotAdded,
			approximate_member_count: memberCount,
			owner: guild.owner ?? false,
			permissions: guild.permissions ?? "0",
		};
	},

	guildDetail(guild: DiscordGuild): SerializedGuildDetail {
		return {
			id: guild.id,
			name: guild.name,
			icon: guild.icon
				? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
				: null,
			ownerId: guild.ownerId ?? "",
			memberCount: guild.memberCount ?? 0,
		};
	},
};

export default async function guildsRoute(
	fastify: FastifyInstance,
): Promise<void> {
	fastify.get(
		"/guilds",
		async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
			try {
				console.log("[/guilds] Request started");

				const session = await auth.api.getSession({
					headers: request.headers,
				});

				if (!session?.session?.userId) {
					console.log("[/guilds] No valid session");
					reply.status(401).send({ error: "Unauthorized" });
					return;
				}

				const userId = session.session.userId;

				console.log("[/guilds] UserId:", userId);

				const redis = request.client.redis as RedisClientType;

				const cachedGuildsJson = await redis.get(`guilds:${userId}`);

				const cachedGuilds: SerializedGuildList[] | null =
					cachedGuildsJson
						? (JSON.parse(
							cachedGuildsJson,
						) as SerializedGuildList[])
						: null;

				if (cachedGuilds) {
					console.log(
						"[/guilds] Cache HIT, returning",
						cachedGuilds.length,
						"guilds",
					);

					reply.status(200).send(cachedGuilds);
					return;
				}

				console.log(
					"[/guilds] Cache MISS, fetching access token",
				);

				const tokenResponse = await auth.api.getAccessToken({
					body: {
						providerId: "discord",
						userId,
					},
					headers: request.headers,
				});

				if (!Validator.token(tokenResponse.accessToken)) {
					console.log("[/guilds] Invalid token");
					reply.status(401).send({ error: "Unauthorized" });
					return;
				}

				const controller = new AbortController();
				const timeoutId = setTimeout(
					() => controller.abort(),
					5000,
				);

				console.log(
					"[/guilds] Fetching guilds from Discord API",
				);

				let response: Response;

				try {
					response = await fetch(
						"https://discord.com/api/v10/users/@me/guilds?limit=100",
						{
							headers: {
								authorization: `Bearer ${tokenResponse.accessToken}`,
								"User-Agent": "Skyndalex/3.0.0",
							},
							signal: controller.signal,
						},
					);
				} finally {
					clearTimeout(timeoutId);
				}

				console.log(
					"[/guilds] Discord API response:",
					response.status,
				);

				if (!response.ok) {
					console.log(
						"[/guilds] Discord API error:",
						response.status,
					);

					reply
						.status(500)
						.send({ error: "Failed to load guilds" });

					return;
				}

				const guildsAPI: unknown = await response.json();

				if (!Validator.guildArray(guildsAPI)) {
					console.log(
						"[/guilds] Invalid guilds response",
					);

					reply
						.status(500)
						.send({ error: "Failed to load guilds" });

					return;
				}

				console.log(
					"[/guilds] Received",
					guildsAPI.length,
					"guilds from Discord",
				);

				const filteredGuilds = guildsAPI.filter((guild) => {
					const isOwner = guild.owner === true;
					const permissions = BigInt(
						guild.permissions ?? "0",
					);
					const hasAdmin =
						(permissions & BigInt(0x8)) === BigInt(0x8);
					const canManage = isOwner || hasAdmin;

					if (!canManage) {
						console.log(
							`[/guilds] Filtered out guild ${guild.id}: owner=${isOwner}, admin=${hasAdmin}`,
						);
					}

					return canManage;
				});

				console.log(
					"[/guilds] Filtered to",
					filteredGuilds.length,
					"manageable guilds",
				);

				const guilds = filteredGuilds.map((guild) => {
					const isBotAdded =
						request.client.guilds.cache.has(guild.id);

					const memberCount =
						request.client.guilds.cache.get(guild.id)
							?.memberCount ?? 0;

					console.log(
						`[/guilds] Guild ${guild.id}: botAdded=${isBotAdded}, memberCount=${memberCount}`,
					);

					return Serializer.guildList(
						guild,
						isBotAdded,
						memberCount,
					);
				});

				await redis.setEx(
					`guilds:${userId}`,
					CACHE_DURATION,
					JSON.stringify(guilds),
				);

				console.log(
					"[/guilds] Cached guilds, sending response",
				);

				reply.status(200).send(guilds);
			} catch (error) {
				console.error(
					"[/guilds] CRITICAL ERROR:",
					error,
				);

				reply
					.status(500)
					.send({ error: "Failed to load guilds" });
			}
		},
	);

	fastify.get(
		"/guild",
		async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
			try {
				console.log("[/guild] Request started");

				const session = await auth.api.getSession({
					headers: request.headers,
				});

				if (!session?.session?.userId) {
					console.log("[/guild] No valid session");
					reply.status(401).send({ error: "Unauthorized" });
					return;
				}

				const guildId = (
					request.headers["x-guild-id"] ||
					request.headers.guildid
				) as string | undefined;

				console.log("[/guild] GuildId:", guildId);

				if (!Validator.guildId(guildId)) {
					console.log(
						"[/guild] Invalid guild ID format",
					);

					reply.status(400).send({
						error: "Invalid request",
					});

					return;
				}

				const redis = request.client.redis as RedisClientType;

				const cachedGuildJson = await redis.get(
					`guild:${guildId}`,
				);

				const cachedGuild: SerializedGuildDetail | null =
					cachedGuildJson
						? (JSON.parse(
							cachedGuildJson,
						) as SerializedGuildDetail)
						: null;

				if (cachedGuild) {
					console.log("[/guild] Cache HIT");
					reply.status(200).send(cachedGuild);
					return;
				}

				console.log(
					"[/guild] Cache MISS, fetching from bot cache",
				);

				const guild =
					request.client.guilds.cache.get(guildId);

				if (!guild) {
					console.log(
						"[/guild] Guild not found in cache",
					);

					reply.status(404).send({
						error: "Guild not accessible",
					});

					return;
				}

				console.log(
					"[/guild] Guild found:",
					guild.name,
				);

				let discordUserId: string;

				try {
					console.log(
						"[/guild] Fetching access token",
					);

					const tokenResponse =
						await auth.api.getAccessToken({
							body: {
								providerId: "discord",
								userId: session.session.userId,
							},
							headers: request.headers,
						});

					if (
						!Validator.token(
							tokenResponse.accessToken,
						)
					) {
						console.log(
							"[/guild] Invalid access token",
						);

						reply.status(401).send({
							error: "Unauthorized",
						});

						return;
					}

					console.log(
						"[/guild] Fetching Discord user info",
					);

					const userResponse = await fetch(
						"https://discord.com/api/v10/users/@me",
						{
							headers: {
								authorization: `Bearer ${tokenResponse.accessToken}`,
							},
						},
					);

					if (!userResponse.ok) {
						console.error(
							"[/guild] Failed to fetch Discord user:",
							userResponse.status,
						);

						reply.status(500).send({
							error: "Authorization failed",
						});

						return;
					}

					const discordUser: unknown =
						await userResponse.json();

					if (
						!Validator.discordUser(discordUser)
					) {
						console.error(
							"[/guild] Invalid Discord user response",
						);

						reply.status(500).send({
							error: "Authorization failed",
						});

						return;
					}

					discordUserId = discordUser.id;

					console.log(
						"[/guild] Discord user ID:",
						discordUserId,
					);
				} catch (error) {
					console.error(
						"[/guild] Error getting Discord user ID:",
						error,
					);

					reply.status(500).send({
						error: "Authorization failed",
					});

					return;
				}

				let member: GuildMember;

				try {
					console.log(
						"[/guild] Fetching member with Discord ID:",
						discordUserId,
					);

					member =
						await guild.members.fetch(discordUserId);

					console.log(
						"[/guild] Member fetched successfully",
					);
				} catch (error) {
					console.error(
						"[/guild] Error fetching member:",
						error,
					);

					reply.status(500).send({
						error: "Access denied",
					});

					return;
				}

				const isOwner =
					member.id === guild.ownerId;

				const hasManageGuild =
					member.permissions.has("ManageGuild");

				const canManage =
					isOwner || hasManageGuild;

				console.log(
					`[/guild] User permissions: owner=${isOwner}, manageGuild=${hasManageGuild}, canManage=${canManage}`,
				);

				if (!canManage) {
					console.log(
						"[/guild] User lacks permission to manage guild",
					);

					reply.status(403).send({
						error: "Access denied",
					});

					return;
				}

				const serializedGuild =
					Serializer.guildDetail({
						id: guild.id,
						name: guild.name,
						icon: guild.icon,
						ownerId: guild.ownerId,
						memberCount: guild.memberCount,
					});

				await redis.setEx(
					`guild:${guildId}`,
					CACHE_DURATION,
					JSON.stringify(serializedGuild),
				);

				console.log(
					"[/guild] Returning guild details",
				);

				reply.status(200).send(serializedGuild);
			} catch (error) {
				console.error(
					"[/guild] CRITICAL ERROR:",
					error,
				);

				reply.status(500).send({
					error: "Access denied",
				});
			}
		},
	);
}