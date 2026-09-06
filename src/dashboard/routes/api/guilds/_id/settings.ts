import type { Guild } from "discord.js";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { requireGuildPermission } from "../../../../middleware/auth.js";

type SettingsBody = {
	autoRole?: string | null;
	welcomeChannel?: string | null;
	goodbyeChannel?: string | null;
	welcomeTitle?: string | null;
	goodbyeTitle?: string | null;
	blockedCommands?: string[];
	blockedChannels?: string[];
};

type ValidationIssue = {
	field: keyof SettingsBody;
	invalidValues: string[];
	reason: string;
};

const guildParamsSchema = {
	type: "object",
	additionalProperties: false,
	required: ["id"],
	properties: {
		id: { type: "string", minLength: 1 },
	},
};

const settingsBodySchema = {
	type: "object",
	properties: {
		guildId: { type: "string", minLength: 1 },
		autoRole: { type: ["string", "null"] },
		welcomeChannel: { type: ["string", "null"] },
		goodbyeChannel: { type: ["string", "null"] },
		welcomeTitle: { type: ["string", "null"] },
		goodbyeTitle: { type: ["string", "null"] },
		blockedCommands: {
			type: "array",
			items: { type: "string" },
		},
		blockedChannels: {
			type: "array",
			items: { type: "string" },
		},
	},
};

const snowflakeRegex = /^\d{17,20}$/;
const channelChunkSize = 25;
const chunkPauseMs = 200;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function chunk<T>(arr: T[], size: number): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
	return out;
}

function unique(values: string[]): string[] {
	return [...new Set(values)];
}

async function fetchMissingChannelsInChunks(
	guild: Guild,
	ids: string[],
): Promise<Set<string>> {
	const found = new Set<string>();
	const parts = chunk(ids, channelChunkSize);

	for (let i = 0; i < parts.length; i++) {
		const current = parts[i];
		const results = await Promise.allSettled(
			current.map(async (id) => {
				const channel = await guild.channels.fetch(id);
				return channel?.id ?? null;
			}),
		);

		for (const result of results) {
			if (result.status === "fulfilled" && result.value) {
				found.add(result.value);
			}
		}

		if (i < parts.length - 1) await sleep(chunkPauseMs);
	}

	return found;
}
async function validateSettingsPayload(
	guild: Guild,
	body: SettingsBody,
	validCommandNames: Set<string>,
): Promise<ValidationIssue[]> {
	const issues: ValidationIssue[] = [];
	const channelFields: Array<[keyof SettingsBody, string[]]> = [];

	const knownFields = new Set(Object.keys(settingsBodySchema.properties));
	const unknownFields = Object.keys(body).filter(
		(key) => !knownFields.has(key),
	);

	for (const field of unknownFields) {
		issues.push({
			field: field as keyof SettingsBody,
			invalidValues: [String((body as Record<string, unknown>)[field])],
			reason: "Unknown field",
		});
	}

	if (body.welcomeChannel !== undefined && body.welcomeChannel !== null) {
		channelFields.push(["welcomeChannel", [body.welcomeChannel]]);
		console.log(channelFields.push(["welcomeChannel", [body.welcomeChannel]]));
	}
	if (body.goodbyeChannel !== undefined && body.goodbyeChannel !== null) {
		channelFields.push(["goodbyeChannel", [body.goodbyeChannel]]);
	}
	if (body.blockedChannels !== undefined) {
		channelFields.push(["blockedChannels", unique(body.blockedChannels)]);
	}

	for (const [field, ids] of channelFields) {
		const badFormat = ids.filter((id) => !snowflakeRegex.test(id));
		if (badFormat.length > 0) {
			issues.push({
				field,
				invalidValues: badFormat,
				reason: "Invalid Discord snowflake format",
			});
		}
	}

	const allChannelIds = unique(
		channelFields
			.flatMap(([, ids]) => ids)
			.filter((id) => snowflakeRegex.test(id)),
	);

	if (allChannelIds.length > 0) {
		await guild.channels.fetch().catch(() => null);

		const knownChannelIds = new Set(guild.channels.cache.keys());
		const unresolved = allChannelIds.filter((id) => !knownChannelIds.has(id));

		if (unresolved.length > 0) {
			const found = await fetchMissingChannelsInChunks(guild, unresolved);
			for (const id of found) knownChannelIds.add(id);
		}

		for (const [field, ids] of channelFields) {
			const bad = ids.filter(
				(id) => snowflakeRegex.test(id) && !knownChannelIds.has(id),
			);
			if (bad.length > 0) {
				issues.push({
					field,
					invalidValues: bad,
					reason: "Channel does not exist in this guild",
				});
			}
		}
	}

	if (body.autoRole !== undefined && body.autoRole !== null) {
		if (!snowflakeRegex.test(body.autoRole)) {
			issues.push({
				field: "autoRole",
				invalidValues: [body.autoRole],
				reason: "Invalid Discord snowflake format",
			});
		} else {
			let exists = guild.roles.cache.has(body.autoRole);
			if (!exists) {
				const role = await guild.roles.fetch(body.autoRole).catch(() => null);
				exists = !!role;
			}
			if (!exists) {
				issues.push({
					field: "autoRole",
					invalidValues: [body.autoRole],
					reason: "Role does not exist in this guild",
				});
			}
		}
	}

	if (body.blockedCommands !== undefined) {
		const invalidCommands = unique(body.blockedCommands).filter(
			(cmd) => !validCommandNames.has(cmd),
		);
		if (invalidCommands.length > 0) {
			issues.push({
				field: "blockedCommands",
				invalidValues: invalidCommands,
				reason: "Command is not registered in the bot",
			});
		}
	}

	return issues;
}
export default async function guildSettingsRoute(fastify: FastifyInstance) {
	fastify.post(
		"/settings",
		{
			preHandler: requireGuildPermission,
			schema: {
				params: guildParamsSchema,
				body: settingsBodySchema,
			},
			config: {
				rateLimit: { max: 30, timeWindow: "1 minute" },
			},
		},
		async (
			request: FastifyRequest<{
				Params: { id: string };
				Body: SettingsBody;
			}>,
			reply: FastifyReply,
		) => {
			const guildId = request.params.id;
			const body = request.body;
			const guild = request.guild;
			if (!guild) return reply.code(500).send({ error: "Guild not found" });

			try {
				const validationIssues = await validateSettingsPayload(
					guild,
					body,
					new Set(request.client.commands.keys()),
				);

				console.log("ValidationIssues", validationIssues);
				if (validationIssues.length > 0) {
					return reply.code(400).send({
						error: "Invalid settings payload",
						validationIssues,
					});
				}

				const result = await request.client.prisma.settings.upsert({
					where: { guildId },
					create: { ...body, guildId },
					update: { ...body },
				});

				return reply.send(result);
			} catch (e) {
				request.log.error(e);
				return reply.code(500).send({ error: "Failed to upsert settings" });
			}
		},
	);
	fastify.get(
		"/settings",
		{ preHandler: requireGuildPermission },
		async (
			request: FastifyRequest<{ Params: { id: string } }>,
			reply: FastifyReply,
		) => {
			const guildId = request.params.id;

			const settings = await request.client.prisma.settings.findUnique({
				where: { guildId },
			});

			console.log("Fetched settings for guild:", guildId, settings);

			if (!settings) return reply.send({});
			return reply.send(settings);
		},
	);
}
