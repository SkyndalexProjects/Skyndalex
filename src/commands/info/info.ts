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
		.setColor("Blurple");
	return interaction.reply({ embeds: [embed] });
}
export const data = {
	...new SlashCommandBuilder().setName("info").setDescription("Bot info")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2])
};
