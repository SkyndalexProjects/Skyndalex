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
    const table = (await client.prisma.economy.findUnique({
      where: {
        uid_guildId: {
          uid: user.id,
          guildId: interaction.guild.id,
        },
      },
    })) || { wallet: null, bank: null };


    const wallet = table.wallet !== null ? BigInt(table.wallet) : BigInt(0);
    const bank = table.bank !== null ? BigInt(table.bank) : BigInt(0);

    const allMoney = (wallet + bank).toLocaleString("en");

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s balance`)
      .addFields([
        {
          name: "Wallet",
          value: `${wallet.toLocaleString("en")}`,
          inline: true,
        },
        {
          name: "Bank",
          value: `${bank.toLocaleString("en")}`,
          inline: true,
        },
        { name: "All", value: `${allMoney}`, inline: true },
      ])
      .setColor("Blurple");

    await interaction.reply({ embeds: [embed] });
  },
};
