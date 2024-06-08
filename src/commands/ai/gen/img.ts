import {
	AttachmentBuilder,
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	type AutocompleteInteraction,
} from "discord.js";
import type { SkyndalexClient } from "../../../classes/Client.js";
import { EmbedBuilder } from "#builders";
import type { HuggingFaceImage, HuggingFaceSearchResult } from "../../../types/structures.js";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const prompt = interaction.options.getString("prompt");
	const defaultModel = "runwayml/stable-diffusion-v1-5";
	const model = interaction?.options?.getString("model") || defaultModel;

	if (model !== defaultModel) {
		// @ts-ignore
		if (!interaction.channel.nsfw) {
			const embed = new EmbedBuilder(client, interaction.locale)
				.setDescription("CUSTOM_MODELS_NSFW_WARNING")
				.setColor("Red");
			return interaction.reply({ embeds: [embed] });
		}
	}
	// Check if user prompted custom model)
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
	const image = new AttachmentBuilder(Buffer.from(imageBuffer), {
		name: "skyndalex_generated_img.png",
	});

	const embed = new EmbedBuilder(client, interaction.locale)
		.setDescription(
			client.i18n.t("IMG_GENERATED", {
				lng: interaction.locale,
				prompt,
				author: interaction.user.username,
			}),
		)
		.setFooter({
			text: "IMG_GENERATED_NSFW_WARNING",
		})
		.setColor("Blue");
	return interaction.editReply({ embeds: [embed], files: [image] });
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("img")
	.setDescription("Generate image with AI")
	.addStringOption((option) =>
		option
			.setName("prompt")
			.setDescription("Prompt for the AI")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
	.setName("model")
	.setDescription("Model to use")
	.setAutocomplete(true)
)
export async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedValue = interaction.options.getFocused(true).value;
	const apiURL = `https://huggingface.co/api/models?search=${focusedValue}&filter=image-generation`;

	const response = await fetch(apiURL, {
		method: "GET",
		headers: {
			"Content-Type": "accept: application/json",
		},
	});
	const json = (await response.json()) as HuggingFaceSearchResult[];

	const choices = json
	.slice(0, 25)
	.map((model) => ({
		name: model.modelId,
		value: model.modelId,
	}));

	await interaction.respond(choices);
}