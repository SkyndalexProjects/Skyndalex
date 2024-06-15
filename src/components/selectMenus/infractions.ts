import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";
import type { StringSelectMenuInteraction } from "discord.js";
export async function run(
	client: SkyndalexClient,
	interaction: StringSelectMenuInteraction,
) {
	const value = interaction.values[0];
	const user = interaction.customId.split("-")[1];
	const searchInfractions = await client.prisma.cases.findMany({
		where: {
			userId: user,
			guildId: interaction.guild.id,
			type: value,
		},
	});
	if (searchInfractions.length <= 0) {
		return interaction.reply({
			content: client.i18n.t(
				"INFRACTIONS_EMBED_CHECKING_MENU_NO_INFRACTIONS",
				{ lng: interaction.locale },
			),
			ephemeral: true,
		});
	}
	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("INFRACTIONS_EMBED_CHECKING_MENU_TITLE", {
			category: `\`${value}\``,
		})
		.setColor("Yellow")
		.setDescription("INFRACTIONS_EMBED_CHECKING_MENU_DESCRIPTION", {
			category: `**${value}**`,
		})
		.setFooter({
			text: "INFRACTIONS_EMBED_FOOTER",
		});

	embed.addFields([
		{
			name: "INFRACTIONS_EMBED_FIELD_TITLE_WHILE_CHECKING",
			value: searchInfractions
				.map(
					(warn) =>
						`• ${
							warn.reason
								? warn.reason
								: client.i18n.t("NO_REASON_PROVIDED")
						} <t:${warn.date}:R> (<@${warn.moderator}>) ||\`[${
							warn.moderator
						}]\`||`,
				)
				.join("\n"),
		},
	]);
	return interaction.update({
		embeds: [embed],
	});
}
