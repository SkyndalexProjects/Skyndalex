import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import figlet from 'figlet';
export async function run(client, interaction) {
    await interaction.deferReply();

    const text = interaction.options.getString('text');

    const ascii = await figlet(`${text}\n`);

    const embed = new EmbedBuilder().setDescription(`\`\`\`${ascii}\`\`\``).setColor('#0c6cfd');
    await interaction.editReply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
    .setName('ascii')
    .setDescription('Ascii.')
    .addStringOption(option => option.setName('text').setDescription('Ascii text').setRequired(true));
