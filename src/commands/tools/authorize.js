import { SlashCommandBuilder } from 'discord.js';

export async function run(client, interaction) {
    await interaction.reply('soon:tm:');
    // const embed = new EmbedBuilder()
    //   .setTitle("Authorize yourself")
    //   .setDescription(
    //     "Click the button below to authorize yourself with Skyndalex",
    //   )
    //   .setColor("DarkButNotBlack");
    //
    // const button = new ButtonBuilder()
    //   .setLabel("Spotify")
    //   .setStyle(ButtonStyle.Link)
    //   .setURL("http://localhost:5000/discord/login");
    //
    // const actionRow = new ActionRowBuilder().addComponents(button);
    // await interaction.reply({
    //   embeds: [embed],
    //   components: [actionRow],
    // });
}
export const data = new SlashCommandBuilder().setName('authorize').setDescription('authorize yourself');
