import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("work").setDescription("Work"),

  async execute(client, interaction) {
    const money = Math.floor(Math.random() * (1000 + 1));

    const user = await client.prisma.economy.findFirst({
      where: { uid: interaction.user.id },
    });

    await client.prisma.economy.upsert({
      where: {
        uid_guildId: {
          guildId: interaction.guild.id,
          uid: interaction.user.id,
        },
      },
      create: {
        guildId: interaction.guild.id,
        uid: interaction.user.id,
        wallet: String(money),
      },
      update: {
        wallet: (parseInt(user?.wallet || "0") + money).toString(),
      },
    });

    const embedSuccess = new EmbedBuilder()
      .setDescription(`You worked and got ${money} coins!`)
      .setColor("DarkGreen");
    await interaction.reply({ embeds: [embedSuccess] });
  },
};
