import type { SkyndalexClient } from "#classes";
import type { GuildMember } from "discord.js";
import { EmbedBuilder } from "#builders";

export async function guildMemberAdd(
	client: SkyndalexClient,
	member: GuildMember,
) {
	const getSettings = await client.prisma.settings.findUnique({
		where: {
			guildId: client.user.id,
		},
	});

	const goodbyeEmbed = new EmbedBuilder(client, member.guild.preferredLocale)
		.setColor("Green")
		.setDescription("GOODBYE_DESCRIPTION", {
            user: member.user.username,
            memberCount: member.guild.memberCount,
        });

	const channel = member.guild.channels.cache.get(getSettings?.welcomeChannel);
	if (channel) {
        // @ts-expect-error
		channel.send({
			embeds: [goodbyeEmbed],
		});
	}
}
