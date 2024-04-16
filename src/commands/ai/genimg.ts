import {
	AttachmentBuilder,
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
	interface HuggingFaceImage {
		generatedImage: ArrayBuffer;
	}

	const prompt = interaction.options.getString("prompt");
	const model = "runwayml/stable-diffusion-v1-5";
	await interaction.deferReply();
	const response = await fetch(
		`https://api-inference.huggingface.co/models/${model}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.HF_TOKEN}`,
			},
			body: JSON.stringify({
				inputs: prompt,
			}),
		},
	);
	const imageBuffer =
		(await response.arrayBuffer()) as HuggingFaceImage["generatedImage"];
	const image = new AttachmentBuilder(
		Buffer.from(imageBuffer),
		"skyndalex_generated_img.png",
	);

	const embed = new EmbedBuilder()
		.setDescription(client.i18n.t("IMG_GENERATED", { lng: interaction.locale, prompt, author: interaction.user.username }))
		.setFooter({ text: client.i18n.t("IMG_GENERATED_NSFW_WARNING", { lng: interaction.locale })})
		.setColor("Blue");
	return interaction.editReply({ embeds: [embed], files: [image] });
}
export const data = new SlashCommandBuilder()
	.setName("genimg")
	.setDescription("Generate image")
	.addStringOption((option) =>
		option
			.setName("prompt")
			.setDescription("Prompt for the AI")
			.setRequired(true),
	);
