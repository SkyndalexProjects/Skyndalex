import {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription("Bot settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("logs")
        .setDescription("Set logs")
        .addChannelOption((option) =>
          option
            .setName("voice-logs-channel")
            .setDescription("Channel for vc-logs")
            .addChannelTypes(ChannelType.GuildText),
        ),
    )
    .addSubcommand((sub) =>
      sub
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
    .addSubcommand((sub) =>
      sub
        .setName("role-settings")
        .setDescription("Set role settings")
        .addRoleOption((option) =>
          option
            .setName("auto-role")
            .setDescription("Automatically give a role to new members"),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("radio")
        .setDescription("Set radio channel")
        .addChannelOption((option) =>
          option
            .setName("radio-channel")
            .setDescription("Channel for radio")
            .addChannelTypes(ChannelType.GuildVoice),
        )
        .addBooleanOption((option) =>
          option.setName("radio").setDescription("Enable radio"),
        )
        .addStringOption((option) =>
          option
            .setName("station")
            .setDescription("Radio station/City name")
            .setAutocomplete(true),
        ),
    ),
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const url = `https://radio.garden/api/search?q=${focusedValue}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "accept: application/json" },
    });
    const json = await response.json();
    const data = json.hits.hits.map(
      (hit) => `${hit._source.title}-${hit._source.url.split("/")[3]}`,
    );

    await interaction.respond(
      data.map((choice) => ({ name: choice, value: choice })),
    );
  },
  async execute(client, interaction) {
    const options = interaction.options._hoistedOptions;
    const updatedSettings = [];

    const fieldMaps = {
      "voice-logs-channel": "voiceLogsChannel",
      "welcome-channel": "welcomeChannel",
      "leave-channel": "leaveChannel",
      "auto-role": "autoRole",
      "radio-channel": "radioChannel",
      radio: "radioEnabled",
      station: "radioStation",
    };

    for (const option of options) {
      const { name: optionName, value: optionValue } = option;

      const fieldToUpdate = fieldMaps[optionName];

      if (fieldToUpdate) {
        await client.prisma.settings.upsert({
          where: { guildId: interaction.guild.id },
          create: {
            guildId: interaction.guild.id,
            [fieldToUpdate]: optionValue,
          },
          update: { [fieldToUpdate]: optionValue },
        });

        updatedSettings.push(`${fieldToUpdate} : : : \`${optionValue}\``);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle("Updated settings")
      .setDescription(
        updatedSettings.length
          ? updatedSettings.join("\n")
          : "No settings updated, or something went wrong.",
      )
      .setColor("#0099ff")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
