import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import find from "find-process";

export default {
  data: new SlashCommandBuilder()
    .setName("custombot")
    .setDescription("Manage your custombot(s)")
    .addSubcommand((subcommand) =>
      subcommand.setName("create").setDescription("Create a custom bot"),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("delete").setDescription("Delete a custom bot"),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("manage").setDescription("Manage your custom bot"),
    ),

  async execute(client, interaction) {
    if (interaction.options.getSubcommand() === "create") {
      const embed = new EmbedBuilder()
        .setTitle("Create a custom bot")
        .setDescription(
          `You can create a custom bot by clicking the button below.`,
        )
        .setColor("DarkButNotBlack");

      const createButton = new ButtonBuilder()
        .setLabel("Create custom bot")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(`customBotCreateBtn-${interaction.user.id}`);

      const createBotActionRow = new ActionRowBuilder().addComponents(
        createButton,
      );

      return interaction.reply({
        embeds: [embed],
        components: [createBotActionRow],
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommand("manage")) {
      const findUserBots = await client.prisma.customBots.findMany({
        where: {
          userId: interaction.user.id,
        },
      });

      console.log("findUserBots", findUserBots);
      if (findUserBots.length === 0)
        return interaction.reply({
          content:
            "It seems that you dont have any custombots in your account. Add some with `/custombot create` command.",
          ephemeral: true,
        });
      const select = new StringSelectMenuBuilder()
        .setCustomId("customBotSelect")
        .setPlaceholder("Choose a custombot!");

      for (const bot of findUserBots) {
        const getBot = await client.users.fetch(bot.clientId).catch(() => null);

        select.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(`Custom bot: ${getBot?.username || "Unknown"}`)
            .setValue(bot.clientId),
        );
      }
      let botOnline = await find(
        "name",
        `customBot ${findUserBots[0]?.clientId}`,
      );
      botOnline = botOnline[0];

      const powerState = new ButtonBuilder()
        .setLabel(`${botOnline ? "Turn bot off" : "Turn bot on"}`)
        .setStyle(
          ButtonStyle[botOnline ? ButtonStyle.Danger : ButtonStyle.Success],
        )
        .setCustomId(`customBotPowerState-${findUserBots[0]?.clientId}`);

      const row = new ActionRowBuilder().addComponents(select);
      const row2 = new ActionRowBuilder().addComponents(powerState);

      const getBot = await client.users
        .fetch(findUserBots[0]?.clientId)
        .catch(() => null);

      const embed = new EmbedBuilder()
        .setTitle(`Manage your custom bot`)
        .setDescription(
          `Current bot: **${getBot?.username || "Unkown"}** [ID: \`${
            findUserBots[0]?.id
          }\`]`,
        )
        .setColor("DarkButNotBlack");

      return interaction.reply({
        embeds: [embed],
        components: [row, row2],
        ephemeral: true,
      });
    } else if (interaction.options.getSubcommandGroup("list")) {
      if (interaction.options.getSubcommand("bots")) {
        console.log("is that even working?");
        const findUserBots = await client.prisma.customBots.findMany({
          where: {
            userId: interaction.user.id,
          },
        });

        if (findUserBots.length === 0)
          return interaction.reply({
            content:
              "It seems that you dont have any custombots in your account. Add some with `/custombot create` command.",
            ephemeral: true,
          });

        const embed = new EmbedBuilder()
          .setTitle("Your custom bots")
          .setColor("DarkButNotBlack");

        for (const bot of findUserBots) {
          const getBot = await client.users
            .fetch(bot.clientId)
            .catch(() => null);

          embed.setFields(
            `Custom bot: ${getBot?.username || "Unknown"}`,
            `ID: \`${bot.id}\``,
          );
        }

        return interaction.reply({ embeds: [embed], ephemeral: true });
      } else if (interaction.options.getSubcommand("presences")) {
        await interaction.reply("soon:tm:");
      }
    }
  },
};
