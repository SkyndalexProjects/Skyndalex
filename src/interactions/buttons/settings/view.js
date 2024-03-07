import { EmbedBuilder } from "discord.js";

export default {
  customId: "viewSettings",
  type: "button",

  run: async (client, interaction) => {
    const settings = await client.prisma.settings.findMany({
      where: {
        guildId: interaction.guild.id,
      },
    });

    const embed = new EmbedBuilder()
      .setColor("DarkButNotBlack")
      .setDescription("Current settings")
      .addFields(
        {
          name: "Welcome channel",
          value: `<#${settings[0].welcomeChannel || "213769420"}>`,
        },
        {
          name: "Leave channel",
          value: `<#${settings[0].leaveChannel || "213769420"}>`,
        },
        {
          name: "AI channel",
          value: `<#${settings[0].aiChannel || "213769420"}>`,
        },
        {
          name: "Radio channel",
          value: `<#${settings[0].radioChannel || "213769420"}>`,
        },
        {
          name: "Auto role",
          value: `<@&${settings[0].autoRole || "213769420"}>`,
        },
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
