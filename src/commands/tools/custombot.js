import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} from "discord.js";
import find from "find-process";

export default {
  data: new SlashCommandBuilder()
    .setName("custombot")
    .setDescription("Manage your custombot(s)")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a custom bot")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("manage")
        .setDescription("Manage your custom bot")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(client, interaction) {
    const findUserBots = await client.prisma.customBots.findMany({
      where: {
        userId: interaction.user.id,
      },
    });

    if (interaction.options.getSubcommand() === "create") {
      const embed = new EmbedBuilder()
        .setTitle("Create a custom bot")
        .setDescription(
          `You can create a custom bot by clicking the button below.`
        )
        .setColor("DarkButNotBlack");

      const createButton = new ButtonBuilder()
        .setLabel("Create custom bot")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`customBotCreateBtn-${interaction.user.id}`);

      const createBotActionRow = new ActionRowBuilder().addComponents(createButton);

      return interaction.reply({
        embeds: [embed],
        components: [createBotActionRow],
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand("manage")) {
      const select = new StringSelectMenuBuilder()
        .setCustomId('customBotSelect')
        .setPlaceholder('Choose a custombot!');

      findUserBots.forEach(bot => {
        const getBot = client.users.cache.get(bot.clientId);
        if (!getBot) client.users.cache.fetch(bot.clientId);

        select.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(`Custom bot: ${getBot.username}`)
            .setValue(bot.clientId)
        );
      });

      const deploy = new ButtonBuilder()
        .setLabel("Deploy bot commands")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`customBotDeploy-${findUserBots[0].clientId}`);

      let botOnline = await find("name", `customBot ${findUserBots[0].clientId}`);
      botOnline = botOnline[0];

      const powerState = new ButtonBuilder()
        .setLabel(`${botOnline ? "Turn bot off" : "Turn bot on"}`)
        .setStyle(ButtonStyle[botOnline ? ButtonStyle.Danger : ButtonStyle.Success])
        .setCustomId(`customBotPowerState-${findUserBots[0].clientId}`);

      const row = new ActionRowBuilder().addComponents(select);
      const row2 = new ActionRowBuilder().addComponents(deploy, powerState);

      const getBot = client.users.cache.get(findUserBots[0].clientId);
      if (!getBot) client.users.cache.fetch(findUserBots[0].clientId);

      const embed = new EmbedBuilder()
        .setTitle(`Manage your custom bot`)
        .setDescription(
          `Current bot: **${getBot.username}**`
        )
        .setColor("DarkButNotBlack");

      return interaction.reply({
        embeds: [embed],
        components: [row, row2],
        ephemeral: true,
      });
    }
  },
};
