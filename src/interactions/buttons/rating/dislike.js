import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

export default {
  customId: "dislike",
  type: "button",

  run: async (client, interaction) => {
    try {
      const dislikeButton = interaction.message.components[0].components.find(
        (button) => button.customId === "dislike",
      );
      const likeButton = interaction.message.components[0].components.find(
        (button) => button.customId === "like",
      );

      let currentDislikes =
        parseInt(dislikeButton.label.match(/\((\d*)\)/)?.[1]) || 0;
      const currentLikes =
        parseInt(likeButton.label.match(/\((\d*)\)/)?.[1]) || 0;

      const updatedDislikeButton = ButtonBuilder.from(dislikeButton)
        .setLabel(`👎 (${currentDislikes + 1})`)
        .setStyle(ButtonStyle.Danger);

      const newActionRow = interaction.message.components.map((oldAR) => {
        const actionRow = new ActionRowBuilder();

        actionRow.addComponents(
          oldAR.components.map((c) => {
            const button = ButtonBuilder.from(c);

            if (interaction.component.customId === c.customId) {
              return updatedDislikeButton;
            }
            return button;
          }),
        );
        return actionRow;
      });

      const prompt = interaction.message.embeds[0].description
        .split('"')[1]
        .replaceAll("**", "");

      const sendDislikeStatsToSupport = new EmbedBuilder()
        .setColor("#ff0000")
        .setTitle(
          `Got new image rating update from guild ${interaction.guild.name}`,
        )
        .setDescription(`👎: ${currentDislikes}\n\nPrompt:\n\`${prompt}\``)
        .setFooter({
          text: `Executed by: ${interaction.user.username} | Guild ID: ${interaction.guild.id}`,
        })
        .setImage(interaction.message.attachments.first().url)
        .setTimestamp();
      client.channels.cache
        .get("1188188386087944293")
        .send({ embeds: [sendDislikeStatsToSupport] });

      return interaction.update({ components: newActionRow });
    } catch (error) {
      console.error(error);
    }
  },
};
