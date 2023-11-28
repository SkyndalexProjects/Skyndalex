import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("bal")
    .setDescription("Check your balance")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to check balance"),
    ),

  async execute(client, interaction) {
    const user = interaction.options.getUser("user") || interaction.user;
    const table = await client.prisma.economy.findUnique({
      where: {
        uid_guildId: {
          uid: user.id,
          guildId: interaction.guild.id,
        },
      },
    });

    if (!table)
      return interaction.reply({
        content: "This user doesn't have an economy account yet!",
        ephemeral: true,
      });

    const allMoney = (
      BigInt(table.wallet || 0) + BigInt(table?.bank || 0)
    ).toLocaleString("en");

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s balance`)
      .addFields([
        {
          name: "Wallet",
          value: `${BigInt(table?.wallet || 0).toLocaleString("en")}`,
          inline: true,
        },
        {
          name: "Bank",
          value: `${BigInt(table?.bank || 0).toLocaleString("en")}`,
          inline: true,
        },
        { name: "All", value: `${allMoney}`, inline: true },
      ])
      .setColor("Blurple");

    await interaction.reply({ embeds: [embed] });
  },
};
