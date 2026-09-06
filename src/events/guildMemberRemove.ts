import {
	ContainerBuilder,
	type GuildMember,
	TextDisplayBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function guildMemberRemove(
	client: SkyndalexClient,
	member: GuildMember,
) {
	const settings = await client.prisma.settings.findUnique({
		where: { guildId: member.guild.id },
	});
	if (!settings?.goodbyeChannel) return;

	const goodbyeChannel = member.guild.channels.cache.get(
		settings.goodbyeChannel,
	);
	if (!goodbyeChannel?.isTextBased()) return;

	const title = new TextDisplayBuilder().setContent(
		`### Goodbye, ${member.user.username}!`,
	);
	const description = new TextDisplayBuilder().setContent(
		`> We now have **${member.guild.memberCount}** members left.`,
	);

	const container = new ContainerBuilder()
		.addTextDisplayComponents(title, description)
		.setAccentColor(0xff0000);

	await goodbyeChannel.send({
		components: [container],
		flags: ["IsComponentsV2"],
	});
}
