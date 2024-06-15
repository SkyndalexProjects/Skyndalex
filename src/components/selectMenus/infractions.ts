import type { SkyndalexClient } from "#classes";
import {
	EmbedBuilder,
	ButtonBuilder,
	StringSelectMenuBuilder,
} from "#builders";
import {
	ActionRowBuilder,
	ButtonStyle,
	type StringSelectMenuInteraction,
} from "discord.js";
export async function run(
	client: SkyndalexClient,
	interaction: StringSelectMenuInteraction,
) {
	if (interaction.user.id !== interaction?.message?.interaction?.user?.id)
		return interaction.reply({
			content: "You can't use this select!",
			ephemeral: true,
		});

	const value = interaction.values[0];
	const user = interaction.customId.split("-")[1];
	const infractions = await client.prisma.cases.findMany({
		where: {
			userId: user,
			guildId: interaction.guild.id,
			type: value,
		},
		orderBy: {
			id: "desc",
		},
	});

	if (infractions.length <= 0) {
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
		});

	const paginationButtons =
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder(client, interaction.locale)
				.setCustomId(`infractionsList-${user}-page_0-${value}`)
				.setLabel("PAGINATION_EMBED_PREVIOUS")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true),
			new ButtonBuilder(client, interaction.locale)
				.setCustomId(`infractionsList-${user}-page_1-${value}`)
				.setLabel("PAGINATION_EMBED_NEXT")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(infractions.length <= 5),
		);

	const select =
		new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder(client, interaction.locale)
				.setPlaceholder("INFRACTIONS_SELECT_PLACEHOLDER")
				.setCustomId(`infractions-${user}`)
				.addOptions([
					{
						label: "INFRACTIONS_SELECT_OPTION_WARNS",
						value: "warn",
					},
					{
						label: "INFRACTIONS_SELECT_OPTION_MUTES",
						value: "timeout",
					},
					{
						label: "INFRACTIONS_SELECT_OPTION_KICKS",
						value: "kick",
					},
					{
						label: "INFRACTIONS_SELECT_OPTION_BANS",
						value: "ban",
					},
				]),
		);

	if (infractions.length > 0) {
		embed.addFields([
			{
				name: "INFRACTIONS_EMBED_FIELD_TITLE",
				value: infractions
					.slice(0, 3)
					.map(
						(infraction) =>
							`- ${
								infraction.active
									? "<:checkpassed:1071529475541565620>"
									: "<:checkfailed:1071528354643181680>"
							} | ${infraction.reason} <t:${
								infraction.date
							}:R> (<@${infraction.moderator}>) ||\`[${
								infraction.moderator
							}]\`||`,
					)
					.join("\n"),
			},
		]);
	}
	return interaction.update({
		embeds: [embed],
		components: [paginationButtons, select],
	});
}
