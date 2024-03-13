import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription("Bot settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
   // TODO: add radio station settings (via button in /radio command)
  // TODO: add radio enabled setting
  // TODO: add possibility to set multiple presences on custombots

  // async autocomplete(interaction) {
  //   const focusedValue = interaction.options.getFocused();
  //   const url = `https://radio.garden/api/search?q=${focusedValue}`;
  //
  //   const response = await fetch(url, {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "accept: application/json",
  //     },
  //   });
  //   const json = await response.json();
  //
  //   console.log(json.hits.hits[0]);
  //
  //   let data = [];
  //   for (let i in json.hits.hits) {
  //     if (json.hits.hits[i]._source.type === "channel") {
  //       data.push(
  //         `${json.hits.hits[i]._source.title}-${
  //           json.hits.hits[i]._source.url.split("/")[3]
  //         }`,
  //       );
  //     }
  //     console.log(data.map((choice) => ({ name: choice, value: choice })));
  //   }
  //
  //   await interaction.respond(
  //     data.map((choice) => ({ name: choice, value: choice })),
  //   );
  // },
  async execute(client, interaction) {
    const channelOptions = new StringSelectMenuBuilder()
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

    const row = new ActionRowBuilder().addComponents(channelOptions);

    const viewSettings = new ButtonBuilder()
      .setLabel("View settings")
      .setStyle(ButtonStyle.Primary)
      .setCustomId("viewSettings");

    const row2 = new ActionRowBuilder().addComponents(viewSettings);

    const embed = new EmbedBuilder()
      .setTitle("Guild settings")
      .setDescription("Please select an option")
      .setColor("Blurple")
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      components: [row, row2],
      ephemeral: true,
    });
  },
};
