import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
export default {
  customId: "settingsChannelelect",
  type: "channel_select_menu_value",

  run: async (client, interaction) => {
    const selectedChannelId = interaction.values[0];
    const selectedChannelType = interaction.message.embeds[0].data.description
      .split(": ")[1]
      .replaceAll("`", "");

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

    const update = await client.prisma.settings.upsert({
      where: {
        guildId: interaction.guild.id,
      },
      update: {
        [selectedChannelType]: selectedChannelId,
      },
      create: {
        guildId: interaction.guild.id,
        [selectedChannelType]: selectedChannelId,
      },
    });
    console.log("update", update);
    const updatedSettings = new EmbedBuilder()
      .setTitle("Settings updated")
      .setDescription(
        `The ${selectedChannelType} channel has been set to <#${selectedChannelId}>`,
      )
      .setColor("Green")
      .setTimestamp();

    await interaction.update({
      embeds: [updatedSettings],
      components: [row, row2],
    });
  },
};
