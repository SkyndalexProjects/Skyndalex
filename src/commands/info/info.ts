import os from "node:os";
import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const botUptimeTimestamp = `<t:${Math.round(
		client.readyTimestamp / 1000,
	)}:R>`;

	const serverUptimeTimestamp = `<t:${Math.floor(
		Math.floor(Date.now() / 1000 - os.uptime()),
	)}:R>`;

	const embed = new EmbedBuilder(client, interaction.locale)
		.setDescription("BOT_INFO_DESCRIPTION", {
			version: process.env.npm_package_version,
			clientId: client.user.id,
		})
		.addFields([
			{
				name: "BOT_INFO_CACHE_STATS",
				value: `- Users: ${client.users.cache.size}\n- Guilds: ${client.guilds.cache.size}\n- Channels: ${client.channels.cache.size}`,
				inline: true,
			},
			{
				name: "BOT_INFO_PROCESS_STATS",
				value: `- Bot uptime: ${botUptimeTimestamp}\n- System uptime: ${serverUptimeTimestamp}\n- Used memory (rss): ${(
					process.memoryUsage().rss /
					1024 /
					1024
				).toFixed(2)} MB`,
				inline: true,
			},
			{
				name: "BOT_INFO_LAVALINK_STATS",
				value: `- Players: ${client.shoukaku.players.size}`,
			},
		])
		.setColor("Blurple");
	return interaction.reply({ embeds: [embed] });
}
export const data = {
	...new SlashCommandBuilder().setName("info").setDescription("Bot info"),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
