import type { SkyndalexClient } from "#classes";
import {
	type MessageComponentInteraction,
	ActionRowBuilder,
	ButtonStyle,
} from "discord.js";
import { ButtonBuilder, EmbedBuilder } from "#builders";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	const buttonMenu = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder(client, interaction.locale)
			.setCustomId("addTicketButton")
			.setLabel("Button")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder(client, interaction.locale)
			.setCustomId("addTicketSelect")
			.setLabel("Select")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder(client, interaction.locale)
			.setCustomId("ticketModal")
			.setLabel("Modal")
			.setStyle(ButtonStyle.Primary),
	);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("TICKETS_SETUP_TITLE")
		.setDescription("TICKETS_SETUP_DESCRIPTION")
		.setFooter({
			text: "SUPPORT_INVITE_FOOTER",
			iconURL: client.user.displayAvatarURL(),
		})
		.setTimestamp()
		.setColor("Blurple")
		.setThumbnail(client.user.displayAvatarURL());

	await interaction.update({
		embeds: [embed],
		components: [buttonMenu],
	});
}
