import { EmbedBuilder } from "discord.js";

const cooldowns = new Map();

export default class GetRandomSentences {
  constructor(client) {
    this.client = client;
  }
  async getRandomSentences(interaction, actionType, money) {
    try {
      const sentences = await this.client.prisma.economySettings.findMany({
        where: {
          guildId: interaction.guild.id,
          type: interaction.commandName,
          action: actionType,
        },
      });
      const settings = await this.client.prisma.economy.findFirst({
        where: { guildId: interaction.guild.id },
      });

      if (!sentences || sentences.length < 1) {
        const missingSentences = new EmbedBuilder()
          .setTitle("Failed to get sentences")
          .setDescription(
            `The economy on this server is probably not set up correctly.\n\n- Missing sentences for command: **${interaction.commandName}**`,
          )
          .setColor("Red")
          .setTimestamp();
        return interaction.reply({ embeds: [missingSentences] });
      }

      const randomIndex = Math.floor(Math.random() * sentences.length);

      return sentences[randomIndex].sentence
        .replace(/{user}/g, interaction.user.tag)
        .replace(/{userid}/g, interaction.user.id)
        .replace(/{usersOnGuild}/g, interaction.guild.members.cache.size)
        .replace(/{money}/g, money)
        .replace(/{currency}/g, settings?.currency || "🌈");
    } catch (error) {
      console.error(error);
    }
  }
}
