import {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription("Bot settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("logs")
        .setDescription("Set logs")
        .addChannelOption((option) =>
          option
            .setName("voice-logs-channel")
            .setDescription("Channel for vc-logs")
            .addChannelTypes(ChannelType.GuildText),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("channels")
        .setDescription("Set channels")
        .addChannelOption((option) =>
          option
            .setName("welcome-channel")
            .setDescription("Channel for welcome")
            .addChannelTypes(ChannelType.GuildText),
        )
        .addChannelOption((option) =>
          option
            .setName("leave-channel")
            .setDescription("Channel for leave")
            .addChannelTypes(ChannelType.GuildText),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("role-settings")
        .setDescription("Set role settings")
        .addRoleOption((option) =>
          option
            .setName("auto-role")
            .setDescription("Automatically give a role to new members"),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("radio")
        .setDescription("Set radio channel")
        .addChannelOption((option) =>
          option
            .setName("radio-channel")
            .setDescription("Channel for radio")
            .addChannelTypes(ChannelType.GuildVoice),
        ),
    ),

  async execute(client, interaction) {
    const options = interaction.options._hoistedOptions;
    console.log("options", options);
    const updatedChannels = [];
    const updatedRoles = [];

    for (const option of options) {
      const channelName = option.name;
      const channelID = option.value;

      const roleName = option.name;
      const roleID = option.value;

      const channelsFieldMap = {
        "voice-logs-channel": "voiceLogsChannel",
        "welcome-channel": "welcomeChannel",
        "leave-channel": "leaveChannel",
      };

      const rolesFieldMap = {
        "auto-role": "autoRole",
      };

      const channelFieldToUpdate = channelsFieldMap[channelName];
      const roleFieldToUpdate = rolesFieldMap[roleName];

      if (channelFieldToUpdate) {
        await client.prisma.settings.upsert({
          where: {
            guildId: interaction.guild.id,
          },
          create: {
            guildId: interaction.guild.id,
            [channelFieldToUpdate]: channelID,
          },
          update: {
            [channelFieldToUpdate]: channelID,
          },
        });

        updatedChannels.push(
          `**${channelName}:** <#${channelID}> \`[${channelID}]\``,
        );
      } else {
        if (roleFieldToUpdate) {
          await client.prisma.settings.upsert({
            where: {
              guildId: interaction.guild.id,
            },
            create: {
              guildId: interaction.guild.id,
              [roleFieldToUpdate]: roleID,
            },
            update: {
              [roleFieldToUpdate]: roleID,
            },
          });

          updatedRoles.push(`**${roleName}:** <@&${roleID}> \`[${roleID}]\``);
        }
      }
    }

    const embed = new EmbedBuilder()
      .setTitle("Updated settings")
      .setDescription(
        `${updatedChannels.length ? updatedChannels.join("\n") : ""}\n\n${
          updatedRoles.length ? updatedRoles.join("\n") : ""
        }`,
      )
      .setColor("#0099ff")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
