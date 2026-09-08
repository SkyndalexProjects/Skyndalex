import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	_client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();

	const text = interaction.options.getString("text", true);
	const cleanText = text.replace(/,/g, "");

	const attachment = await _client.canvas.dailyMail.createAttachment(
		{
			text: cleanText,
		},
		"quote.png",
	);
	await interaction.editReply({ files: [attachment] });
}

export const data = new SlashCommandBuilder()
	.setName("daily_mail")
	.setDescription("Display text on a daily mail")
	.addStringOption((option) =>
		option.setName("text").setDescription("Text to display").setRequired(true),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
