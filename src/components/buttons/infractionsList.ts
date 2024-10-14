import {
	ActionRowBuilder,
	ButtonStyle,
	type MessageComponentInteraction,
} from "discord.js";
import {
	ButtonBuilder,
	EmbedBuilder,
	StringSelectMenuBuilder,
} from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction<"cached">,
) {
	if (interaction.user.id !== interaction?.message?.interaction?.user?.id)
		return interaction.reply({
			content: "You can't use this button!",
			ephemeral: true,
		});

	try {
		const [_id, userId, pageId, type] = interaction.customId.split("-");
		const page = Number(pageId.split("_")[1]);

		const guildId = interaction.guild
			? interaction.guild.id
			: `DN:${interaction.channelId}`;

		const infractions = await client.prisma.cases.findMany({
			where: {
				userId: userId,
				guildId,
				type,
			},
			orderBy: {
				id: "desc",
			},
			take: 3,
			skip: page * 3,
		});

		const totalInfractions = await client.prisma.cases.count({
			where: {
				userId: userId,
				guildId,
				type,
			},
		});

		const totalPages = Math.ceil(totalInfractions / 3);

		const user = await client.users.fetch(userId);
		const embed = new EmbedBuilder(client, interaction.locale)
			.setTitle("INFRACTIONS_EMBED_TITLE")
			.setColor(interaction.message.embeds[0].color)
			.setDescription("INFRACTIONS_EMBED_DESCRIPTION", {
				pages: totalPages.toString(),
				currentPage: (page + 1).toString(),
				stats: totalInfractions.toString(),
			})
			.setFooter({
				text: "INFRACTIONS_EMBED_FOOTER",
				textArgs: {
					user: user.username,
					pages: totalPages.toString(),
					currentPage: (page + 1).toString(),
				},
			});

		if (infractions.length > 0) {
			embed.addFields([
				{
					name: "INFRACTIONS_EMBED_FIELD_TITLE",
					value: infractions
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

		const row = new ActionRowBuilder<ButtonBuilder>().setComponents([
			new ButtonBuilder(client, interaction.locale)
				.setCustomId(`infractionsList-${userId}-page_${page - 1}`)
				.setLabel("PAGINATION_EMBED_PREVIOUS")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page <= 0),
			new ButtonBuilder(client, interaction.locale)
				.setCustomId(`infractionsList-${userId}-page_${page + 1}`)
				.setLabel("PAGINATION_EMBED_NEXT")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled((page + 1) * 3 >= totalInfractions),
		]);

		const select =
			new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				new StringSelectMenuBuilder(client, interaction.locale)
					.setPlaceholder("INFRACTIONS_SELECT_PLACEHOLDER")
					.setCustomId(`infractions-${userId}`)
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

		await interaction.update({
			embeds: [embed],
			components: [row, select],
		});
	} catch (e) {
		console.error("e", e);
	}
}
