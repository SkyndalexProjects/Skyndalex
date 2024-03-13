import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

export default {
  customId: "updates-page",
  type: "button",

  run: async (client, interaction) => {
    const page = Number(interaction.customId.split("_")[1]);

    const channel = await client.channels.fetch("1183142476270276819");
    const messages = (await channel.messages.fetch({ limit: 100 }))
      .filter((x) => x?.content?.length >= 1)
      .map((x) => x);

    console.log("messages", messages);
    const embed = new EmbedBuilder()
      .setTitle(`Page ${page + 1} of ${messages.length + 1}`)
      .setDescription(`${messages[page].content}`);

    const row = new ActionRowBuilder().setComponents([
      new ButtonBuilder()
        .setCustomId(`updates-page_${page - 1}`)
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 0),
      new ButtonBuilder()
        .setCustomId(`updates-page_${page + 1}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= messages.length),
    ]);

    await interaction.update({ embeds: [embed], components: [row] });
  },
};
