import os from "node:os";
import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	version,
} from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import type { BotData } from "#types";

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

	const botData = (await client.rest.get(
		`/applications/${client.user.id}`,
	)) as BotData;

	const embed = new EmbedBuilder(client, interaction.locale)
		.addFields([
			{
				name: "BOT_INFO_CACHE_STATS",
				value: `${client.i18n.t("BOT_STATS_GUILD_COUNT", {
					count: client.guilds.cache.size,
					lng: interaction.locale,
				})}\n${client.i18n.t("BOT_STATS_USERAPPS_COUNT", {
					count: botData.approximate_user_install_count,
					lng: interaction.locale,
				})}\n${client.i18n.t("BOT_STATS_USER_COUNT", {
					count: client.users.cache.size,
					lng: interaction.locale,
				})}\n${client.i18n.t("BOT_STATS_CHANNEL_COUNT", {
					count: client.channels.cache.size,
					lng: interaction.locale,
				})}`,
			},
			{
				name: "BOT_INFO_SYSTEM_STATS",
				value: `\n${client.i18n.t("BOT_STATS_OS", {
					os: os.platform(),
					lng: interaction.locale,
				})}\n${client.i18n.t("BOT_STATS_NODE_VERSION", {
					version: process.version,
					lng: interaction.locale,
				})}\n${client.i18n.t("BOT_STATS_NODE_MEMORY", {
					memory: Math.round(
						process.memoryUsage().heapUsed / 1024 / 1024,
					),
					lng: interaction.locale,
				})} MB\n${client.i18n.t("BOT_STATS_DISCORDJS_VERSION", {
					version: version,
					lng: interaction.locale,
				})}`,
			},
			{
				name: "BOT_INFO_UPTIME",
				value: `Bot: ${botUptimeTimestamp}\nServer: ${serverUptimeTimestamp}`,
			},
		])
		.setColor("Blurple");
	return interaction.reply({ embeds: [embed] });
}
export const data = {
	...new SlashCommandBuilder().setName("stats").setDescription("Bot stats")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2])
};
