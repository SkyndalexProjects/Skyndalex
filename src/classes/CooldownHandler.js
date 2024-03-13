import { EmbedBuilder } from "discord.js";

const cooldowns = new Map();

export default class CooldownHandler {
  constructor(client) {
    this.client = client;
  }
  async set(interaction, time, userId) {
    try {
      if (cooldowns.has(userId)) {
        const remainingTime = cooldowns.get(userId) - Date.now();
        const cooldownRemaining = new EmbedBuilder()
          .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.avatarURL(),
          })
          .setDescription(
            `⏰ You are on cooldown. Please wait ${Math.ceil(
              remainingTime / 1000,
            )} seconds.`,
          )
          .setColor("Yellow")
          .setTimestamp();

        return interaction.reply({
          embeds: [cooldownRemaining],
          ephemeral: true,
        });
      }
      cooldowns.set(userId, Date.now() + time);

      setTimeout(() => {
        cooldowns.delete(userId);
      }, time);
    } catch (error) {
      console.error(error);
    }
  }
}
