import { EmbedBuilder, SlashCommandBuilder, version } from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("info").setDescription("Bot info"),

  async execute(client, interaction) {
    const embed = new EmbedBuilder()
      .setDescription(
        `\`\`\`BOT INFO\`\`\`\n\n* Guilds: ${
          client.guilds.cache.size
        }\n* Users: ${client.users.cache.size}\n* Channels: ${
          client.channels.cache.size
        }\n* Uptime: ${client.uptime}\n* Ping: ${
          client.ws.ping
        }\n* Using RAM: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(
          2,
        )} MB\n* Node.js: ${
          process.version
        }\n* Discord.js: ${version}\n* Bot Version: 1.1.1`,
      )
      .setColor("Blurple")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
