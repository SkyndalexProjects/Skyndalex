import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
export async function run(client, interaction) {
    const customBotCreateModal = new ModalBuilder()
        .setCustomId('customBotCreateModal')
        .setTitle('Custombot configuration');

    const token = new TextInputBuilder()
        .setCustomId('customBotCreateModalToken')
        .setLabel('Bot token')
        .setPlaceholder('Bot token')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const clientID = new TextInputBuilder()
        .setCustomId('customBotCreateModalClientID')
        .setLabel('client ID')
        .setPlaceholder('Bot client ID')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(token);
    const secondActionRow = new ActionRowBuilder().addComponents(clientID);

    customBotCreateModal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(customBotCreateModal);
}
