import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";
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
        clientId,
        token,
      },
    });

    const embed = new EmbedBuilder().setTitle("Manage your custom bot");

    const powerState = new ButtonBuilder()
      .setLabel("Turn bot on")
      .setStyle(ButtonStyle.Success)
      .setCustomId(`customBotPowerState-${interaction.user.id}`);

    const deployCommands = new ButtonBuilder()
      .setLabel("Deploy bot commands")
      .setStyle(ButtonStyle.Primary)
      .setCustomId(`customBotDeploy-${interaction.user.id}`);

    const actionRow = new ActionRowBuilder().addComponents(
      powerState,
      deployCommands,
    );

    return interaction.update({
      embeds: [embed],
      components: [actionRow],
      ephemeral: true,
    });
  },
};
