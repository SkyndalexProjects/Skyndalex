import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("whitelist")
    .setDescription("Add guild to whitelist [Bot Owner Only]"),

  async execute(client, interaction) {
    const owner = "817883855310684180";
    if (interaction.user.id !== owner)
      return interaction.reply("You are not the bot owner!");

    const getCurrentWhitelist = await client.prisma.whitelist.findMany({
      where: {
        guildId: interaction.guild.id,
      },
    });

    await client.prisma.whitelist.upsert({
      where: { guildId: interaction.guild.id },
      create: {
        guildId: interaction.guild.id,
        whitelisted: true,
      },
      update: {
        whitelisted: !getCurrentWhitelist[0]?.whitelisted,
      },
    });

    await interaction.reply(
      `Guild is now ${
        !getCurrentWhitelist[0]?.whitelisted
          ? "✅ whitelisted"
          : "🗑️ unwhitelisted"
      }`,
    );
  },
};
