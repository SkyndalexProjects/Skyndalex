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
	const text = interaction.options.getString("text");
	if (!text) return;

	const attachment = await _client.canvas.changeMyMind.createAttachment(
		{
			text,
		},
		"quote.png",
	);

	await interaction.editReply({
		files: [attachment],
	});
}

export const data = new SlashCommandBuilder()
	.setName("changemymind")
	.setDescription('Sends image with "Change my mind" meme!')
	.addStringOption((option) =>
		option
			.setName("text")
			.setDescription("Text to put on the image")
			.setRequired(true)
			.setMaxLength(80)
			.setMinLength(1),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
