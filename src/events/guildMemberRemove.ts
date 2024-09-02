import type { BaseGuildTextChannel, GuildMember } from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function guildMemberRemove(
	client: SkyndalexClient,
	member: GuildMember,
) {
	const getSettings = await client.prisma.settings.findUnique({
		where: {
			guildId: member.guild.id,
		},
	});

	const goodbyeEmbed = new EmbedBuilder(client, member.guild.preferredLocale)
		.setColor("Red")
		.setDescription("GOODBYE_DESCRIPTION", {
			user: member.user.username,
			memberCount: member.guild.memberCount,
		});

	const channel = member.guild.channels.cache.get(
		getSettings?.goodbyeChannel,
	);
	if (channel) {
		(channel as BaseGuildTextChannel).send({
			embeds: [goodbyeEmbed],
		});
	}
}
