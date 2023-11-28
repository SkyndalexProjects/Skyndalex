import { EmbedBuilder, SlashCommandBuilder, version } from "discord.js";
import os from "os";

export default {
  data: new SlashCommandBuilder().setName("info").setDescription("Bot info"),

  async execute(client, interaction) {
    const totalSeconds = client.uptime / 1000;
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const serverUptime = os.uptime();
    const serverDays = Math.floor(serverUptime / 86400);
    const serverHours = Math.floor((serverUptime % 86400) / 3600);
    const serverMinutes = Math.floor((serverUptime % 3600) / 60);
    const serverSeconds = Math.floor(serverUptime % 60);

    const embed = new EmbedBuilder()
      .setDescription(
        `Hey I'm glad you are using this bot. Here are a couple of links you might find useful:\n📎 | [\`Website\`](https://skyndalex.xyz)\n📎 | [\`Invite\`](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=0&scope=bot%20applications.commands)\n📎 | [\`Support server\`](https://discord.gg/Ue6SWzmbJw) `,
      )
      .addFields([
        {
          name: `📊 | Stats`,
          value: `**Servers:** ${
            client.guilds.cache.size
          }\n**Users:** ${client.guilds.cache.reduce(
            (a, b) => a + b.memberCount,
            0,
          )}\n**Channels:** ${client.channels.cache.size}\n**Emojis:** ${
            client.emojis.cache.size
          }`,
          inline: true,
        },
        {
          name: `🖥️ | Uptime`,
          value: `**Bot:** ${days}d ${hours}h ${minutes}m ${seconds}s\n**OS:** ${serverDays}d ${serverHours}h ${serverMinutes}m ${serverSeconds}s`,
          inline: true,
        },
        {
          name: `🚀 | RAM Usage`,
          value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
            2,
          )} MB (heapUsed)/${(os.totalmem() / 1024 / 1024 / 1024).toFixed(
            2,
          )} GB`,
          inline: true,
        },
        {
          name: `✅ | Versions`,
          value: `**Node.Js:** ${process.version}\n**Discord.Js:** ${version}`,
          inline: true,
        },
      ])
      .setColor("Blurple")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
