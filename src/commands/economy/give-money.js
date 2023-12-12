import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("give-money")
    .setDescription("Give money for someone")
    .addIntegerOption((option) =>
      option.setName("amount").setDescription("Amount").setRequired(true),
    )
    .addUserOption((option) => option.setName("user").setDescription("User")),

  async execute(client, interaction) {
    const member = interaction.options.getUser("user") || interaction.user;
    const user = await client.prisma.economy.findFirst({
      where: { uid: member.id },
    });
    if (!user) return interaction.reply(`User not found`);

    const settings = await client.prisma.economy.findFirst({
      where: { guildId: interaction.guild.id },
    });

    await client.prisma.economy.upsert({
      where: {
        uid_guildId: {
          guildId: interaction.guild.id,
          uid: member.id,
        },
      },
      create: {
        guildId: interaction.guild.id,
        uid: member.id,
        wallet: interaction.options.getInteger("amount").toString(),
      },
      update: {
        wallet: (
          parseInt(user?.wallet || "0") +
          interaction.options.getInteger("amount")
        ).toString(),
      },
    });

    const embedAdded = new EmbedBuilder()
      .setColor("#00ff00")
      .setDescription(
        `Added ${interaction.options.getInteger("amount").toString()} ${
          settings?.currency || "🌈"
        } to <@${member.id}> \`[${member.username}]\``,
      );
    await interaction.reply({ embeds: [embedAdded] });
  },
};
