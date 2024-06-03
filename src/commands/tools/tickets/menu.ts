import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	ButtonStyle,
	ButtonBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { EmbedBuilder } from "../../../classes/builders/EmbedBuilder.js";
import type { SkyndalexClient } from "../../../classes/Client.js";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const selects = await client.prisma.ticketSelects.findMany({
		where: {
			guildId: interaction.guild.id,
		},
	});

	const selectActionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
	const buttonActionRow = new ActionRowBuilder<ButtonBuilder>();

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("TICKETS_MENU_TITLE")
		.setDescription("TICKETS_MENU_DESCRIPTION")
		.setColor("Blue");

	if (selects.length > 0) {
		const selectOptions = selects.map((select) => {
			return new StringSelectMenuOptionBuilder()
				.setLabel(select.label.toString())
				.setDescription(select.description.toString())
				.setValue(`select-${select.customId}`);
		});

		const selectBuilder = new StringSelectMenuBuilder()
			.setPlaceholder("Select an option")
			.setCustomId("ticketSelectCategory")
			.addOptions(selectOptions);

		selectActionRow.addComponents(selectBuilder);

		return interaction.reply({
			embeds: [embed],
			components: [selectActionRow],
		});
	}

	const styles = {
		PRIMARY: ButtonStyle.Primary,
		SECONDARY: ButtonStyle.Secondary,
		SUCCESS: ButtonStyle.Success,
		DANGER: ButtonStyle.Danger,
	};

	const buttons = await client.prisma.ticketButtons.findMany({
		where: {
			guildId: interaction.guild.id,
			assignedToSelect: null,
		},
	});

	if (buttons.length <= 0)
		return interaction.reply({
			content: client.i18n.t("NO_CUSTOM_BUTTONS_FOUND", {
				lng: interaction.locale,
			}),
		});

	for (const button of buttons) {
		const buttonBuilder = new ButtonBuilder()
			.setStyle(styles[button.style])
			.setLabel(button.label)
			.setCustomId(`ticketCategory-${button.customId}`);
		buttonActionRow.addComponents(buttonBuilder);
	}

	return interaction.reply({
		embeds: [embed],
		components: [buttonActionRow],
	});
}

export const data = new SlashCommandSubcommandBuilder()
	.setName("menu")
	.setDescription("Tickets menu");
