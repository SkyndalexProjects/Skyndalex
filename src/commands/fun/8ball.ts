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
				value: client.i18n.t(
					`8BALL_RESPONSES.${Math.floor(Math.random() * 5)}`,
					{ lng: interaction.locale },
				),
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
				.setMaxLength(200)
				.setMinLength(1),
		)
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2])
};
