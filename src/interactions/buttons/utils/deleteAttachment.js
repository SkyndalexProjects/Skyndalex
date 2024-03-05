import { EmbedBuilder } from "discord.js";

export default {
  customId: "deleteAttachment",
  type: "button",

  run: async (client, interaction) => {
    const isAuthor =
      interaction.message.interaction.user.id === interaction.user.id;

    if (!isAuthor) {
      return interaction.reply({
        content:
          "You can delete only your attachments. If you are administrator, you can do it by Discord UI",
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setDescription(
        `Attachments sucessfully deleted by ${interaction.user.username}`,
      )
      .setColor("Red");

    await interaction.update({
      embeds: [embed],
      components: [],
      attachments: [],
    });
  },
};
