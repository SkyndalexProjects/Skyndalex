import type { SkyndalexClient } from "#classes";
import {
	ContainerBuilder,
	GuildMember,
	MessageFlags,
	TextDisplayBuilder,
} from "discord.js";

export async function guildMemberAdd(
	client: SkyndalexClient,
	member: GuildMember,
) {
	const settings = await client.prisma.settings.findUnique({
		where: { guildId: member.guild.id },
	});
	if (!settings?.welcomeChannel) return;

	const welcomeChannel = member.guild.channels.cache.get(
		settings.welcomeChannel,
	);
	if (!welcomeChannel || !welcomeChannel.isTextBased()) return;

	const title = new TextDisplayBuilder().setContent(
		`### Welcome to the server, ${member.user.username}!`,
	);
	const description = new TextDisplayBuilder().setContent(
		`> We now have **${member.guild.memberCount}** members.`,
	);

	const container = new ContainerBuilder()
		.addTextDisplayComponents(title, description)
		.setAccentColor(0x00ff00);

	await welcomeChannel.send({
		components: [container],
		flags: ["IsComponentsV2"],
	});
}
