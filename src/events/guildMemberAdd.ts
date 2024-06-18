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

	const welcomeEmbed = new EmbedBuilder(client, member.guild.preferredLocale)
		.setColor("Green")
		.setDescription("WELCOME_DESCRIPTION");

	if (getSettings?.autoRole) {
		const role = member.guild.roles.cache.get(getSettings.autoRole);
		if (role) {
			member.roles.add(role);
		}
	}
}
