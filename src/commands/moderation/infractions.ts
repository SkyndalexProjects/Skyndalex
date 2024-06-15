import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonStyle,
} from "discord.js";
import {
	ButtonBuilder,
	EmbedBuilder,
	StringSelectMenuBuilder,
} from "#builders";
import type { SkyndalexClient } from "#classes";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	const user = interaction.options.getUser("user");
	if (user.bot)
		return interaction.reply({
			content: client.i18n.t("INFRACTIONS_BOT_PROHIBITED", {
				lng: interaction.locale,
			}),
			ephemeral: true,
		});

	const select =
		new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder(client, interaction.locale)
				.setPlaceholder("INFRACTIONS_SELECT_PLACEHOLDER")
				.setCustomId(`infractions-${user.id}`)
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

		const guildId =  interaction.guild
		? interaction.guild.id
		: `DN:${interaction.channelId}`;
	const infractions = await client.prisma.cases.findMany({
		where: {
			userId: user.id,
			guildId,
			type: "warn",
		},
		orderBy: {
			id: "desc",
		},
	});

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("INFRACTIONS_EMBED_TITLE")
		.setColor("Blurple")
		.setDescription("INFRACTIONS_EMBED_DESCRIPTION")
		.setFooter({ text: "INFRACTIONS_EMBED_FOOTER", textArgs: { user: user.username, pages: "0", currentPage: "0", stats: infractions.length.toString()} });
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

	const paginationButtons =
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder(client, interaction.locale)
				.setCustomId(`infractionsList-${user.id}-page_0`)
				.setLabel("PAGINATION_EMBED_PREVIOUS")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true),
			new ButtonBuilder(client, interaction.locale)
				.setCustomId(`infractionsList-${user.id}-page_1`)
				.setLabel("PAGINATION_EMBED_NEXT")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(infractions.length <= 3),
		);
	await interaction.reply({
		embeds: [embed],
		components: [paginationButtons, select],
	});
}
export const data = {
	...new SlashCommandBuilder()
		.setName("infractions")
		.setDescription("List all infractions of a user.")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The user to warn.")
				.setRequired(true),
		),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
