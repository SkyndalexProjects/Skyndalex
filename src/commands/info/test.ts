import { EmbedBuilder } from "../../classes/builders/EmbedBuilder";
import type { SkyndalexClient } from "../../classes/Client";
import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const embed = new EmbedBuilder(client, interaction.locale)
		.setDescription("TEST")

	await interaction.reply({ embeds: [embed] });
}
export const data = new SlashCommandBuilder()
	.setName("test")
	.setDescription("test");
