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
        )
        .addChannelOption((option) =>
          option
            .setName("ai-channel")
            .setDescription("Channel for AI")
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
    )
    .addSubcommand((sub) =>
      sub
        .setName("view")
        .setDescription("View settings")
    ),

  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const url = `https://radio.garden/api/search?q=${focusedValue}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "accept: application/json",
      },
    });
    const json = await response.json();

    console.log(json.hits.hits[0]);

    let data = [];
    for (let i in json.hits.hits) {
      if (json.hits.hits[i]._source.type === "channel") {
        data.push(
          `${json.hits.hits[i]._source.title}-${
            json.hits.hits[i]._source.url.split("/")[3]
          }`,
        );
      }
      console.log(data.map((choice) => ({ name: choice, value: choice })));
    }

    await interaction.respond(
      data.map((choice) => ({ name: choice, value: choice })),
    );
  },
  async execute(client, interaction) {
    if (interaction.options.getSubcommand() === "view") {
      const settings = await client.prisma.settings.findFirst({
        where: { guildId: interaction.guild.id },
      });

      const embed = new EmbedBuilder()
        .setTitle("Current settings")
        .addFields([
          {
            name: "Voice logs channel",
            value: String(settings?.voiceLogsChannel || "Not set"),
          },
          {
            name: "Welcome channel",
            value: String(settings?.welcomeChannel || "Not set"),
          },
          {
            name: "Leave channel",
            value: String(settings?.leaveChannel || "Not set"),
          },
          {
            name: "Auto role",
            value: String(settings?.autoRole || "Not set"),
          },
          {
            name: "Radio channel",
            value: String(settings?.radioChannel || "Not set"),
          },
          {
            name: "Radio enabled",
            value: String(settings?.radioEnabled || "Not set"),
          },
          {
            name: "Radio station",
            value: String(settings?.radioStation || "Not set"),
          },
          {
            name: "AI channel",
            value: String(settings?.aiChannel || "Not set"),
          },
        ])
        .setColor("#0099ff")
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else {
      const options = interaction.options._hoistedOptions;
      const updatedSettings = [];

      const fieldMaps = {
        "voice-logs-channel": "voiceLogsChannel",
        "welcome-channel": "welcomeChannel",
        "leave-channel": "leaveChannel",
        "auto-role": "autoRole",
        "radio-channel": "radioChannel",
        "radio": "radioEnabled",
        "station": "radioStation",
        "ai-channel": "aiChannel",
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

    }
  },
};
