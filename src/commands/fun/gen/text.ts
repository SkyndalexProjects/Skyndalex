import {
	ActionRowBuilder,
	type AutocompleteInteraction,
	ButtonStyle,
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	type BaseGuildTextChannel,
} from "discord.js";
import { ButtonBuilder } from "#builders";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import type { HuggingFaceSearchResult, HuggingFaceText } from "#types";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const defaultModel = "meta-llama/Meta-Llama-3-8B-Instruct";
	const model = interaction?.options?.getString("model") || defaultModel;

	if (model !== defaultModel) {
		if (!(interaction.channel as BaseGuildTextChannel).nsfw) {
			const embed = new EmbedBuilder(client, interaction.locale)
				.setDescription("CUSTOM_MODELS_NSFW_WARNING")
				.setColor("Red");
			return interaction.reply({ embeds: [embed] });
		}
	}
	try {
		await interaction.deferReply();
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

		const button = new ButtonBuilder(client, interaction.locale)
			.setLabel("BUTTON_CONTINUE")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("continue");

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

		const embed = new EmbedBuilder(client, interaction.locale)
			.setDescription(`${json[0].generated_text}`)
			.setColor("Blue");

		return interaction.editReply({
			embeds: [embed],
			components: [row],
		});
	} catch (e) {
		console.error(e);

		const embedError = new EmbedBuilder(client, interaction.locale)
			.setTitle("ERROR")
			.setDescription("AI_GENERATION_ERROR", {
				lng: interaction.locale,
				model,
			})
			.setColor("Red");

		return interaction.editReply({
			embeds: [embedError],
		});
	}
}
export async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedValue = interaction.options.getFocused(true).value;
	const apiURL = `https://huggingface.co/api/models?search=${focusedValue}&filter=text-generation`;

	const response = await fetch(apiURL, {
		method: "GET",
		headers: {
			"Content-Type": "accept: application/json",
		},
	});
	const json = (await response.json()) as HuggingFaceSearchResult[];

	const choices = json.slice(0, 25).map((model) => ({
		name: model.modelId,
		value: model.modelId,
	}));

	await interaction.respond(choices);
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("text")
	.setDescription("Generate text using AI")
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
			.setAutocomplete(true),
	);
