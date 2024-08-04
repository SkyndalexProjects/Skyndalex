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
	const question = interaction.options.getString("question");

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle(`🎱 8ball - ${question}`)
		.addFields([
			{
				name: "8BALL_RESPONSE",
				value: `8BALL_RESPONSES.${Math.floor(Math.random() * 5)}`,
				inline: true,
			},
		])
		.setColor("Aqua");

	await interaction.reply({ embeds: [embed] });
}

export const data = {
	...new SlashCommandBuilder()
		.setName("8ball")
		.setDescription("Ask the magic 8ball a question!")
		.addStringOption((option) =>
			option
				.setName("question")
				.setDescription("The question you want to ask the 8ball")
				.setRequired(true)
				.setMaxLength(500)
				.setMinLength(1),
		),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
