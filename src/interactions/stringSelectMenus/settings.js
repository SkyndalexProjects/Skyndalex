import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle, ChannelSelectMenuBuilder,
  EmbedBuilder, ModalBuilder, RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle
} from "discord.js";
import find from "find-process";
export default {
  customId: "settingsSelect",
  type: "string_select_menu_value",

  run: async (client, interaction) => {
    const chooseChannel = new ChannelSelectMenuBuilder()
      .setCustomId("settingsChannelelect")
      .setPlaceholder("Choose a channel")
      .setMinValues(1)
      .setMaxValues(1);
    const channel = new ActionRowBuilder().addComponents(chooseChannel);

    const chooseRole = new RoleSelectMenuBuilder()
      .setCustomId("settingsRoleSelect")
      .setPlaceholder("Choose a role")
      .setMinValues(1)
      .setMaxValues(1);
    const role = new ActionRowBuilder().addComponents(chooseRole);

    const updatedEmbed = new EmbedBuilder()
      .setTitle("Selecting channel")
      .setDescription(`Current option: \`${interaction.values[0]}\``)
      .setColor("Yellow")
      .setTimestamp();

    switch (interaction.values[0]) {
      case "welcomeChannel":
        console.log("ok")
        await interaction.update({ components: [channel], embeds: [updatedEmbed]})
        break;
      case "leaveChannel":
        await interaction.update({ components: [channel], embeds: [updatedEmbed]})
        break;
      case "autoRole":
        await interaction.update({ components: [role], embeds: [updatedEmbed]})
        break;
      case "aiChannel":
        await interaction.update({ components: [channel], embeds: [updatedEmbed]})
        break;
      case "radioChannel":
        await interaction.update({ components: [channel], embeds: [updatedEmbed]})
        break;
      case "settings_custombot":
        const modal = new ModalBuilder()
          .setCustomId("customBotSettings")
          .setTitle("Add presence")

        const activityType = new TextInputBuilder()
          .setCustomId("activity")
          .setPlaceholder("Activity type")
          .setLabel("Activity type")
          .setMinLength(1)
          .setMaxLength(100)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)

        const name = new TextInputBuilder()
          .setCustomId("name")
          .setPlaceholder("Name")
          .setLabel("Name")
          .setMinLength(1)
          .setMaxLength(100)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)


        const firstActionRow = new ActionRowBuilder().addComponents(activityType)
        const secondActionRow = new ActionRowBuilder().addComponents(name)

        modal.addComponents(firstActionRow, secondActionRow)

        await interaction.showModal(modal)
        break;
    }
  },
};
