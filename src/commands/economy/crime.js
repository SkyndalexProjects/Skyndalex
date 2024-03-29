import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export async function run(client, interaction) {
    const money = Math.floor(Math.random() * (1000 + 1));
    const actions = ['Win', 'Lose'];
    const action = actions[Math.floor(Math.random() * actions.length)];

    const user = await client.prisma.economy.findFirst({
        where: { uid: interaction.user.id }
    });

    // TODO: add cooldown, set .catch() => null

    if (action === 'Win') {
        const win = await client.sentences.getRandomSentences(interaction, 'win', money);

        if (!win) return;

        await client.economyBalance.updateWallet(interaction, interaction.user.id, +money);
        const embedSuccess = new EmbedBuilder().setDescription(`${win}`).setColor('DarkGreen');
        await interaction.reply({ embeds: [embedSuccess] });
    } else {
        const lose = await client.sentences.getRandomSentences(interaction, 'lose', money);

        if (!lose) return;

        await client.economyBalance.updateWallet(interaction, interaction.user.id, -money);
        const embedFail = new EmbedBuilder().setDescription(`${lose}`).setColor('DarkRed');
        await interaction.reply({ embeds: [embedFail] });
    }
}
export const data = new SlashCommandBuilder().setName('crime').setDescription('Crime');
