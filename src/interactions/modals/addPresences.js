import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
export default {
  customId: "customBotSettings",
  type: "modal",

  run: async (client, interaction) => {
    const activity = interaction.fields.getTextInputValue("activity");
    const name = interaction.fields.getTextInputValue("name");

    const clientId = interaction.fields.getTextInputValue("clientId");

    const getCustom = await client.prisma.customBots.findMany({
      where: {
        userId: interaction.user.id,
        clientId: clientId,
      },
    });

    const custombot = getCustom[0];

    await client.prisma.customBots.update({
      where: {
        id_clientId: {
          id: custombot.id,
          clientId: custombot.clientId,
        },
      },
      data: {
        customPresenceActivity: activity,
        customPresenceName: name,
      },
    });

    const chooseChannelsAgain = new StringSelectMenuBuilder()
      .setCustomId("settingsSelect")
      .setPlaceholder("Choose setting")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Welcome")
          .setValue("welcomeChannel")
          .setDescription("Set welcome channel"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Leave")
          .setValue("leaveChannel")
          .setDescription("Set leave channel"),
        new StringSelectMenuOptionBuilder()
          .setLabel("AI channel")
          .setValue("aiChannel")
          .setDescription("Set AI channel"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Radio")
          .setValue("radioChannel")
          .setDescription("Set radio channel"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Autorole")
          .setValue("autoRole")
          .setDescription("Set autorole role"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Custombot presences")
          .setValue("settings_custombot")
          .setDescription("Set custombot presences"),
      );

    const viewSettings = new ButtonBuilder()
      .setLabel("View settings")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("viewSettings");

    const row = new ActionRowBuilder().addComponents(chooseChannelsAgain);
    const row2 = new ActionRowBuilder().addComponents(viewSettings);

    const updatedSettings = new EmbedBuilder()
      .setTitle("Settings updated")
      .setDescription(
        `Custombot presence updated to \`${name}\` with activity \`${activity}\` and clientId \`${clientId}\``,
      )
      .setColor("Green")
      .setTimestamp();

    await interaction.update({
      embeds: [updatedSettings],
      components: [row, row2],
    });
  },
};
