import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

export default {
  customId: "like",
  type: "button",

  run: async (client, interaction) => {
    try {
      const likeButton = interaction.message.components[0].components.find(
        (button) => button.customId === "like",
      );
      const dislikeButton = interaction.message.components[0].components.find(
        (button) => button.customId === "dislike",
      );
      console.log("dislikeButton", dislikeButton);
      console.log("likeButton", likeButton);

      let currentLikes =
        parseInt(likeButton.label.match(/\((\d*)\)/)?.[1]) || 0;
      const currentDislikes =
        parseInt(dislikeButton.label.match(/\((\d*)\)/)?.[1]) || 0;

      console.log("👎", currentDislikes);
      console.log("👍", currentLikes);

      const updatedLikeButton = ButtonBuilder.from(likeButton)
        .setLabel(`👍 (${currentLikes + 1})`)
        .setStyle(ButtonStyle.Success);

      const newActionRow = interaction.message.components.map((oldAR) => {
        const actionRow = new ActionRowBuilder();

        actionRow.addComponents(
          oldAR.components.map((c) => {
            const button = ButtonBuilder.from(c);

            if (interaction.component.customId === c.customId) {
              return updatedLikeButton;
            }
            return button;
          }),
        );
        return actionRow;
      });

      // console.log("splitted", interaction.message.embeds[0].description.split("\"")[1].replaceAll("**", ""));

      const prompt = interaction.message.embeds[0].description
        .split('"')[1]
        .replaceAll("**", "");

      const sendLikeStatsToSupport = new EmbedBuilder()
        .setColor("#00ff00")
        .setTitle(
          `Got new image rating update from guild ${interaction.guild.name}`,
        )
        .setDescription(`👍: ${currentLikes}\n\nPrompt:\n\`${prompt}\``)
        .setFooter({
          text: `Executed by: ${interaction.user.username} | Guild ID: ${interaction.guild.id}`,
        })
        .setImage(interaction.message.attachments.first().url)
        .setTimestamp();
      client.channels.cache
        .get("1188188386087944293")
        .send({ embeds: [sendLikeStatsToSupport] });

      await interaction.deferUpdate();
      return interaction.message.edit({ components: newActionRow });
    } catch (error) {
      console.error(error);
    }
  },
};
