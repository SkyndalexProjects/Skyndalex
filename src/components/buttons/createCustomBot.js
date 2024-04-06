import {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
export async function run(client, interaction) {
	const customBotCreateModal = new ModalBuilder()
		.setCustomId("createCustomBotModal")
		.setTitle("Custombot configuration");

	const token = new TextInputBuilder()
		.setCustomId("customBotCreateModalToken")
		.setLabel("Bot token")
		.setPlaceholder("Bot token")
		.setStyle(TextInputStyle.Short)
		.setMaxLength(100)
		.setRequired(true);

	const firstActionRow = new ActionRowBuilder().addComponents(token);

	customBotCreateModal.addComponents(firstActionRow);

	await interaction.showModal(customBotCreateModal);
}
