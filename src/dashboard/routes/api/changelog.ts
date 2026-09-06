import type { Guild, Message, TextChannel } from "discord.js";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { auth } from "../../../auth.js";

type ChangelogRow = {
	id: string;
	user: string;
	avatar: string | null;
	role: string;
	change: string;
	details?: string;
	date: string;
};

const fetchLimit = 100;
const cacheKeyPrefix = "changelog:channel";
const cacheTTL = 3600;

function extractMessageBody(msg: Message): string {
	const parts: string[] = [];
	if (msg.content?.trim()) parts.push(msg.content.trim());

	for (const embed of msg.embeds ?? []) {
		if (embed.title) parts.push(embed.title);
		if (embed.description) parts.push(embed.description);
	}

	if (parts.length === 0 && msg.attachments?.size > 0) {
		parts.push(
			`[${msg.attachments.size} attachment${msg.attachments.size > 1 ? "s" : ""}]`,
		);
	}

	return parts.join("\n\n").trim();
}

async function buildRowsFromDiscord(
	guild: Guild,
	channel: TextChannel,
): Promise<ChangelogRow[]> {
	const messages = await channel.messages.fetch({ limit: fetchLimit });

	const relevant = messages
		.filter((msg) => {
			const hasContent = extractMessageBody(msg).length > 0;
			return (
				(process.env.CHANGELOG_AUTHOR_ID
					? msg.author.id === process.env.CHANGELOG_AUTHOR_ID
					: true) && hasContent
			);
		})
		.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
		.toJSON();

	return Promise.all(
		relevant.map(async (msg) => {
			const details = extractMessageBody(msg);
			return {
				id: msg.id,
				user: msg.author.username,
				avatar: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.png?size=256`,
				role: await guild.members
					.fetch(msg.author.id)
					.then((m) => m.roles.highest?.name || "Member")
					.catch(() => "Member"),
				change:
					details
						.split("\n")
						.map((l) => l.trim())
						.find(Boolean) ?? "No details",
				details,
				date: new Date(msg.createdTimestamp).toISOString(),
			};
		}),
	);
}

export default async function changelog(fastify: FastifyInstance) {
	fastify.get(
		"/changelog",
		async (request: FastifyRequest, reply: FastifyReply) => {
			const session = await auth.api.getSession({ headers: request.headers });
			if (!session) return reply.status(401).send({ error: "Unauthorized" });

			const cacheKey = `${cacheKeyPrefix}:${process.env.CHANGELOG_CHANNEL_ID}`;

			console.log("im here");
			const cached = await request.client.redis
				.hGetAll(cacheKey)
				.catch(() => null);

			console.log("cached", cached);
			if (cached && Object.keys(cached).length > 0) {
				return reply.send(
					Object.values(cached).map((r) => JSON.parse(r as string)),
				);
			}

			const guild = request.client.guilds.cache.get(
				process.env.SUPPORT_GUILD_ID as string,
			);
			if (!guild)
				return reply
					.status(503)
					.send({ error: "Source guild is not available" });

			const fetchedChannel = await request.client.channels
				.fetch(process.env.CHANGELOG_CHANNEL_ID as string)
				.catch(() => null);
			if (!fetchedChannel)
				return reply
					.status(404)
					.send({ error: "Source channel is not available" });

			if (!fetchedChannel.isTextBased() || fetchedChannel.isDMBased()) {
				return reply
					.status(400)
					.send({ error: "Source channel is not text-based" });
			}

			if (
				!("guildId" in fetchedChannel) ||
				fetchedChannel.guildId !== process.env.SUPPORT_GUILD_ID
			) {
				return reply
					.status(400)
					.send({ error: "Source channel guild mismatch" });
			}

			const rows = await buildRowsFromDiscord(
				guild,
				fetchedChannel as TextChannel,
			);

			const hashData = Object.fromEntries(
				rows.map((row) => [row.id, JSON.stringify(row)]),
			);

			await request.client.redis.hSet(cacheKey, hashData);
			await request.client.redis.expire(cacheKey, cacheTTL);

			return reply.send(rows);
		},
	);
}
