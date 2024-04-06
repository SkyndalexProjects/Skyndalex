import { EmbedBuilder, SlashCommandBuilder, version } from "discord.js";
import os from "os";

export async function run(client, interaction) {
	const botUptimeTimestamp =`<t:${Math.round(client.readyTimestamp / 1000)}:R>`


	const serverUptimeTimestamp =`<t:${Math.floor(
		Math.floor(Date.now() / 1000 - os.uptime()),
	)}:R>`

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
				value: `**Bot:** ${botUptimeTimestamp}\n**OS:** ${serverUptimeTimestamp}`,
				inline: true,
			},
			{
				name: `🚀 | RAM Usage`,
				value: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(
					2,
				)} MB (rss)/${(os.totalmem() / 1024 / 1024 / 1024).toFixed(
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
}
export const data = new SlashCommandBuilder()
	.setName("info")
	.setDescription("Bot info");
