import type { SkyndalexClient } from "#classes";
import { ModalBuilder, TextInputBuilder } from "#builders";
import {
	ActionRowBuilder,
	TextInputStyle,
	type MessageComponentInteraction,
} from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	const modal = new ModalBuilder(client, interaction.locale)
		.setCustomId("addTicketCustomSelectModal")
		.setTitle("ADD_TICKET_CUSTOM_SELECT_MODAL");

	const name = new TextInputBuilder(client, interaction.locale)
		.setCustomId("selectName")
		.setLabel("ADD_TICKET_CUSTOM_SELECT_MODAL_NAME")
		.setPlaceholder("ADD_TICKET_CUSTOM_SELECT_MODAL_NAME")
		.setRequired(true)
		.setStyle(TextInputStyle.Short);

	const row = new ActionRowBuilder<TextInputBuilder>().addComponents(name);
	modal.addComponents(row);

	await interaction.showModal(modal);
}