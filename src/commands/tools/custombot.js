import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import find from "find-process";

export default {
  data: new SlashCommandBuilder()
    .setName("custombot")
    .setDescription("Manage your custombot(s)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(client, interaction) {
    const bot = await client.prisma.customBots.findUnique({
      where: { userId: interaction.user.id },
    });

    if (!bot) {
      const noBotEmbed = new EmbedBuilder()
        .setDescription(
          `It seems like you don't have custom bot yet, click the button below to create it`,
        )
        .setColor("DarkButNotBlack");

      const createButton = new ButtonBuilder()
        .setLabel("Create custom bot")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`customBotCreateBtn-${interaction.user.id}`);

      const createBotActionRow = new ActionRowBuilder().addComponents(createButton);

      return interaction.reply({
        embeds: [noBotEmbed],
        components: [createBotActionRow],
        ephemeral: true,
      });
    } else {
      let botOnline = await find("name", `customBot ${interaction.user.id}`);
      botOnline = botOnline[0];

      const embed = new EmbedBuilder().setTitle("Manage your custom bot");

      const powerState = new ButtonBuilder()
        .setLabel(`${botOnline ? "Turn bot off" : "Turn bot on"}`)
        .setStyle(ButtonStyle[botOnline ? ButtonStyle.Danger : ButtonStyle.Success])
        .setCustomId(`customBotPowerState-${interaction.user.id}`);

      const deployCommands = new ButtonBuilder()
        .setLabel("Deploy bot commands")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`customBotDeploy-${interaction.user.id}`);

      console.log(client.id !== process.env.CLIENT_ID)

      const actionRow = new ActionRowBuilder().addComponents(powerState, deployCommands);

      return interaction.reply({
        embeds: [embed],
        components: [actionRow],
        ephemeral: true,
      });
    }
  },
};
