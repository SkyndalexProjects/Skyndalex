import { EmbedBuilder } from "discord.js";
export default {
  customId: "customBotCreateModal",
  type: "modal",

  run: async (client, interaction) => {
    const token = interaction.fields.getTextInputValue(
      "customBotCreateModalToken",
    );
    const clientId = interaction.fields.getTextInputValue(
      "customBotCreateModalClientID",
    );

    await client.prisma.customBots.create({
      data: {
        userId: interaction.user.id,
        clientId: clientId,
        token: token,
      },
    });

    const embed = new EmbedBuilder()
      .setTitle(`Custom bot created`)
      .setDescription(
        `Your custom bot has been created.\nYou can manage it via **/custombot manage** command`,
      )
      .setColor("Green");

    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
