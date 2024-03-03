import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder
} from "discord.js";
import { setCharset } from "express/lib/utils.js";
import find from "find-process";
export default {
  customId: "customBotSelect",
  type: "string_select_menu_value",

  run: async (client, interaction) => {
    const getBot = client.users.cache.get(interaction.values[0]);
    if (!getBot) client.users.cache.fetch(interaction.values[0]);

    const findUserBots = await client.prisma.customBots.findMany({
      where: {
        userId: interaction.user.id,
      },
    });

    let botOnline = await find("name", `customBot ${interaction.values[0]}`);
    botOnline = botOnline[0];

    const embed = new EmbedBuilder()
      .setTitle("Manage your custom bot")
      .setDescription(
        `Current bot: **${getBot.username}**`
      )
      .setColor("DarkButNotBlack");

    const deploy = new ButtonBuilder()
      .setLabel("Deploy bot commands")
      .setStyle(ButtonStyle.Primary)
      .setCustomId(`customBotDeploy-${interaction.values[0]}`);

    const powerState = new ButtonBuilder()
      .setLabel(`${botOnline ? "Turn bot off" : "Turn bot on"}`)
      .setStyle(ButtonStyle[botOnline ? ButtonStyle.Danger : ButtonStyle.Success])
      .setCustomId(`customBotPowerState-${interaction.values[0]}`);

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

    const row = new ActionRowBuilder().addComponents(select);
    const row2 = new ActionRowBuilder().addComponents(deploy, powerState);

    await interaction.update({ embeds: [embed], components: [row, row2] })
  },
};
