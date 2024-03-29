import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
export async function run(client, interaction) {
    await interaction.deferReply();

    const texts = [
        'Skill issue',
        'Yes',
        'No',
        'Maybe',
        'Probably',
        'Probably not',
        "I don't know",
        "I don't think so",
        'I think so',
        'I think not',
        "I don't think",
        'I think',
        'I know'
    ];
    const random = Math.floor(Math.random() * texts.length);

    const embed = new EmbedBuilder()
        .setTitle(`❓ | ${interaction.options.getString('question')}`)
        .setDescription(`${texts[random]}`)
        .setFooter({ text: `Asked by ${interaction.user.tag}` })
        .setColor('#ffd606');

    await interaction.editReply({ embeds: [embed] });
}
export const data = new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Magic ball')
    .addStringOption(option => option.setName('question').setDescription('Question').setRequired(true));
