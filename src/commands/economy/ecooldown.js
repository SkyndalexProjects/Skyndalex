import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ecooldown")
    .setDescription("Set or remove cooldown for each economy command.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Set cooldown")
        .addStringOption((option) =>
          option
            .setName("command-name")
            .setDescription("Economy command type (e.g., work)")
            .setRequired(true),
        )
        .addIntegerOption((option) =>
          option
            .setName("cooldown")
            .setDescription("Cooldown in seconds")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove cooldown")
        .addIntegerOption((option) =>
          option.setName("id").setDescription("ID to remove").setRequired(true),
        ),
    ),

  async execute(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const type = interaction.options.getString("command-name");
      const commands = ["work", "crime", "rob", "role-collect"];

      if (!commands.includes(type)) {
        return interaction.reply(
          `Invalid command name provided.\n\nAvailable commands: \`${commands.join(
            ", ",
          )}\`\nCommand name provided: ${type}`,
        );
      }

      const cooldownSeconds = interaction.options.getInteger("cooldown");

      if (type && cooldownSeconds !== null) {
        const cooldownMillis = cooldownSeconds * 1000;

        const [row] = await client.prisma.economySettings.findMany({
          where: {
            guildId: interaction.guild.id,
          },
          orderBy: {
            id: "desc",
          },
          take: 1,
        });

        await client.prisma.economySettings.create({
          data: {
            id: row?.id + 1 || 0,
            type: type,
            guildId: interaction.guild.id,
            cooldown: cooldownMillis,
          },
        });

        const embed = new EmbedBuilder()
          .setTitle("Cooldown Updated")
          .setDescription(
            `Cooldown for **${type}** command set to \`${cooldownSeconds}\` seconds.\n\n***CooldownID: ${
              row?.id + 1
            }***`,
          )
          .setColor("#0099ff")
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle("Invalid Command Usage")
          .setDescription("Please provide valid type and cooldown options.")
          .setColor("#ff0000")
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } else if (subcommand === "remove") {
      const IDtoRemove = interaction.options.getInteger("id");

      if (IDtoRemove) {
        await client.prisma.economySettings.delete({
          where: {
            id_guildId: {
              guildId: interaction.guild.id,
              id: IDtoRemove,
            },
          },
        });

        const embed = new EmbedBuilder()
          .setTitle("Cooldown Removed")
          .setDescription(`Cooldown removed ***(ID: ${IDtoRemove})***.`)
          .setColor("#0099ff")
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setTitle("Invalid Command Usage")
          .setDescription("Please provide a valid type to remove cooldown.")
          .setColor("#ff0000")
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    }
  },
};
