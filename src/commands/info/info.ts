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
	const invite = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=0&scope=bot%20applications.commands`;

	const embed = new EmbedBuilder(client, interaction.locale)
		.setDescription("BOT_INFO_DESCRIPTION", {
			version: process.env.npm_package_version,
			clientId: client.user.id,
			invite,
		})
		.setColor("Blurple");
	return interaction.reply({ embeds: [embed] });
}
export const data = {
	...new SlashCommandBuilder()
		.setName("info")
		.setDescription("Bot info")
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
};
