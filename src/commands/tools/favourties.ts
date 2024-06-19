import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonStyle,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import {
	EmbedBuilder,
	StringSelectMenuBuilder,
	ButtonBuilder,
} from "#builders";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const radiosPerPage = 15;

	const favourties = await client.prisma.favourties.findMany({
		where: {
			userId: interaction.user.id,
		},
		orderBy: {
			id: "desc",
		},
		take: radiosPerPage,
	});

	if (favourties.length <= 0) {
		return interaction.reply({
			content: "No favourties found",
			ephemeral: true,
		});
	}

	const totalPages = Math.ceil(favourties.length / radiosPerPage);
	const currentPage = 1;

	const select =
		new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			new StringSelectMenuBuilder(client, interaction.locale)
				.setPlaceholder("RADIO_FAVOURTIES_PLAY")
				.setCustomId("favourtiesPlay")
				.addOptions(
					favourties
						.slice(
							(currentPage - 1) * radiosPerPage,
							currentPage * radiosPerPage,
						)
						.map((favourite) => ({
							label: favourite.radioName,
							value: favourite.radioId,
						})),
				),
		);

	const paginationButtons =
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder(client, interaction.locale)
				.setCustomId(`favourtiesList-page_${currentPage - 1}`)
				.setLabel("PAGINATION_EMBED_PREVIOUS")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentPage === 1),
			new ButtonBuilder(client, interaction.locale)
				.setCustomId(`favourtiesList-page_${currentPage + 1}`)
				.setLabel("PAGINATION_EMBED_NEXT")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(currentPage === totalPages),
		);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("RADIO_FAVOURTIES_TITLE")
		.setDescription("RADIO_FAVOURTIES_DESCRIPTION")
		.setFooter({ text: "SUPPORT_INVITE_FOOTER", iconURL: client.user.displayAvatarURL() })
		.setColor("Blue")
		.addFields([
			{
				name: "FAVOURTIED_EMBED_FIELD",
				value: favourties
					.slice(
						(currentPage - 1) * radiosPerPage,
						currentPage * radiosPerPage,
					)
					.map((radio) => `\`# ${radio.id}\` → ${radio.radioName}`)
					.join("\n"),
			},
		]);

	return interaction.reply({
		embeds: [embed],
		components: [paginationButtons, select],
		ephemeral: true,
	});
}
export const data = new SlashCommandBuilder()
	.setName("favourties")
	.setDescription("Your radio favourites");
