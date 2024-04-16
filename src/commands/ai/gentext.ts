import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { fetch } from "undici";
import type { SkyndalexClient } from "../../classes/Client";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	interface HuggingFaceText {
		generated_text: string;
	}

	await interaction.deferReply();
	const model = "mistralai/Mixtral-8x7B-Instruct-v0.1";
	const prompt = interaction.options.getString("prompt");

	const data = {
		inputs: prompt,
	};

	const response = await fetch(
		`https://api-inference.huggingface.co/models/${model}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.HF_TOKEN}`,
			},
			body: JSON.stringify(data),
		},
	);
	const json = (await response.json()) as HuggingFaceText[];

	const button = new ButtonBuilder()
		.setLabel("Continue")
		.setStyle(ButtonStyle.Primary)
		.setCustomId("continue");

	const embed = new EmbedBuilder()
		.setDescription(`${json[0].generated_text}`)
		.setColor("Blue");
	return interaction.editReply({
		embeds: [embed],
		components: [new ActionRowBuilder().addComponents(button)],
	});
}

export const data = new SlashCommandBuilder()
	.setName("gentext")
	.setDescription("Generate text")
	.addStringOption((option) =>
		option
			.setName("prompt")
			.setDescription("Prompt for the AI")
			.setRequired(true),
	);
