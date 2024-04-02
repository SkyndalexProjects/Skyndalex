import {
  ActionRowBuilder, ButtonBuilder,
  ChannelSelectMenuBuilder, ChannelType, RoleSelectMenuBuilder,
  ButtonStyle
} from "discord.js";

export async function run(client, interaction) {
  const setting = interaction.customId.split("-")[2];
  if (setting.endsWith("Channel")) {
    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId(`changeSelect-${setting}`)
      .setPlaceholder("Select a channel")
      .addChannelTypes(ChannelType.GuildText)
      .setMinValues(1)
      .setMaxValues(1);
    return interaction.update({ components: [new ActionRowBuilder().addComponents(channelSelect)] });
  } else if (setting.endsWith("Role")) {
    const roleSelect = new RoleSelectMenuBuilder()
      .setCustomId(`changeSelect-${setting}`)
      .setPlaceholder("Select a role")
      .setMinValues(1)
      .setMaxValues(1);
    return interaction.update({ components: [new ActionRowBuilder().addComponents(roleSelect)] });
  } else if (setting.endsWith("Voice")) {
    const channelSelect = new ChannelSelectMenuBuilder()
      .setCustomId(`changeSelect-${setting}`)
      .setPlaceholder("Select a channel")
      .addChannelTypes(ChannelType.GuildVoice)
      .setMinValues(1)
      .setMaxValues(1);
    return interaction.update({ components: [new ActionRowBuilder().addComponents(channelSelect)] });
  } else {
    const enable = new ButtonBuilder()
      .setCustomId(`enable-${setting}`)
      .setLabel("Enable")
      .setStyle(ButtonStyle.Success);

    const disable = new ButtonBuilder()
      .setCustomId(`disable-${setting}`)
      .setLabel("Disable")
      .setStyle(ButtonStyle.Danger);

    return interaction.update({ components: [new ActionRowBuilder().addComponents(enable, disable)] });
  }
}
