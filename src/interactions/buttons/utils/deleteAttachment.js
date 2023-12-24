import { PermissionFlagsBits } from "discord.js";

export default {
  customId: "deleteAttachment",
  type: "button",

  run: async (client, interaction) => {
    const isAuthor = interaction.user.id === interaction.message.author.id;
    const isAdmin = interaction.guild.members.cache
      .get(interaction.user.id)
      ?.permissions.has(PermissionFlagsBits.Administrator);

    if (!isAuthor && !isAdmin) {
      await interaction.deferUpdate();
      return interaction.followUp({
        content:
          "You don't have permission to use this button. Only administrators and message authors can use this button.",
        ephemeral: true,
      });
    }

    const message = interaction.message;
    await interaction.deferUpdate();

    await message.edit({
      content: `Attachments deleted by ${interaction.user.username}`,
      files: [],
    });
  },
};
