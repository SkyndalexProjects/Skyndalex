import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	ButtonStyle,
	ButtonBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const selects = await client.prisma.ticketSelects.findMany({
		where: {
			guildId: interaction.guild.id,
		},
	});

	const buttons = await client.prisma.ticketButtons.findMany({
		where: {
			guildId: interaction.guild.id,
			assignedToSelect: null,
		},
	});

	const styles = {
		PRIMARY: ButtonStyle.Primary,
		SECONDARY: ButtonStyle.Secondary,
		SUCCESS: ButtonStyle.Success,
		DANGER: ButtonStyle.Danger,
	};

	const selectActionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
	const buttonActionRow = new ActionRowBuilder<ButtonBuilder>();

	for (const button of buttons) {
		const buttonBuilder = new ButtonBuilder()
			.setStyle(styles[button.style])
			.setLabel(button.label)
			.setCustomId(`ticketCategory-${button.customId}`);
		buttonActionRow.addComponents(buttonBuilder);
	}

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("TICKETS_MENU_TITLE")
		.setDescription("TICKETS_MENU_DESCRIPTION")
		.setFooter({
			text: "SUPPORT_INVITE_FOOTER",
			iconURL: client.user.displayAvatarURL(),
		})
		.setColor("Blue");

	if (selects.length > 0) {
		const selectOptions = selects.map((select) => {
			return new StringSelectMenuOptionBuilder()
				.setLabel(select.label.toString())
				.setValue(`select-${select.customId}`);
		});

		if (selectOptions.length >= 25) {
			const embed = new EmbedBuilder(client, interaction.locale)
				.setTitle("SELECT_LIMIT_REACHED")
				.setDescription("SELECT_LIMIT_REACHED_DESC")
				.setColor("Red")
				.setTimestamp();

			return interaction.reply({ embeds: [embed] });
		}
		const selectBuilder = new StringSelectMenuBuilder()
			.setPlaceholder("Select an option")
			.setCustomId("ticketSelectCategory")
			.addOptions(selectOptions);

		selectActionRow.addComponents(selectBuilder);

		return interaction.reply({
			embeds: [embed],
			components: [buttonActionRow, selectActionRow],
		});
	}

	if (buttons.length <= 0)
		return interaction.reply({
			content: client.i18n.t("NO_CUSTOM_BUTTONS_FOUND", {
				lng: interaction.locale,
			}),
		});

	return interaction.reply({
		embeds: [embed],
		components: [buttonActionRow],
	});
}

export const data = new SlashCommandSubcommandBuilder()
	.setName("menu")
	.setDescription("Tickets menu");
