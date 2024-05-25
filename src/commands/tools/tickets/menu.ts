import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	ButtonStyle,
	ButtonBuilder,
	ActionRowBuilder,
} from "discord.js";
import { EmbedBuilder } from "classes/builders/EmbedBuilder";
import type { SkyndalexClient } from "../../../classes/Client";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const buttons = await client.prisma.ticketButtons.findMany({
		where: {
			guildId: interaction.guild.id,
		},
	});

	if (buttons.length <= 0)
		return interaction.reply({
			content: client.i18n.t("NO_CUSTOM_BUTTONS_FOUND", {
				lng: interaction.locale,
			}),
			ephemeral: true,
		});

	const styles = {
		PRIMARY: ButtonStyle.Primary,
		SECONDARY: ButtonStyle.Secondary,
		SUCCESS: ButtonStyle.Success,
		DANGER: ButtonStyle.Danger,
	};

	const actionRow = new ActionRowBuilder<ButtonBuilder>();
	for (const button of buttons) {
		const buttonBuilder = new ButtonBuilder()
			.setStyle(styles[button.style])
			.setLabel(button.label)
			.setCustomId(`ticketCategory-${button.customId.toString()}`);
		actionRow.addComponents(buttonBuilder);
	}
	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("TICKETS_MENU_TITLE")
		.setDescription("TICKETS_MENU_DESCRIPTION")
		.setColor("Blue");
	return interaction.reply({
		embeds: [embed],
		components: [actionRow],
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("menu")
	.setDescription("Tickets menu");
