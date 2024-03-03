import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
export default {
  data: new SlashCommandBuilder()
    .setName('updates')
    .setDescription('List all announcements'),
  async execute(client, interaction) {
    const channel = await client.channels.fetch('1183142476270276819');
    const data = (await channel.messages.fetch({ limit: 100 })).map(x => x);

    const embed = new EmbedBuilder()
      .setTitle(`Page 1 of ${data.length - 1}`)
      .setDescription(`${data[0].content}`)

    const row = new ActionRowBuilder()
      .setComponents([
        new ButtonBuilder()
          .setCustomId('updates-page_0')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('updates-page_1')
          .setLabel('Next')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(data.length === 1),
      ]);

    interaction.reply({ embeds: [embed], components: [row] });
  },
}