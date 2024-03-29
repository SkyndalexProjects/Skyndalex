import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';

export async function run(client, interaction) {
    const button = new ButtonBuilder().setCustomId('ping').setLabel('Ping').setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder().addComponents(button);
    await interaction.reply({
        content: `Ping: \`${client.ws.ping}\``,
        components: [actionRow]
    });
}

export const data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');
