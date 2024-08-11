import { HfInference } from "@huggingface/inference";
import {
	ActionRowBuilder,
	AttachmentBuilder,
	type AutocompleteInteraction,
	BaseGuildTextChannel,
	ButtonStyle,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import { ButtonBuilder, EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import type { HuggingFaceImage, HuggingFaceSearchResult } from "#types";
const hf = new HfInference(process.env.HF_TOKEN);

const imageQueue = new Map();

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const prompt = interaction.options.getString("prompt");
	const defaultModel = "stabilityai/stable-diffusion-2-1";
	const model = interaction?.options?.getString("model") || defaultModel;

	const queuePosition = imageQueue.size + 1;
	const taskId = `${interaction.user.id}-${Date.now()}`;

	if (model !== defaultModel) {
		if (!(interaction.channel as BaseGuildTextChannel).nsfw) {
			const embed = new EmbedBuilder(client, interaction.locale)
				.setDescription("CUSTOM_MODELS_NSFW_WARNING")
				.setColor("Red");
			return interaction.reply({ embeds: [embed] });
		}
	}

	if (!imageQueue.has(interaction.user.id)) {
		imageQueue.set(taskId, {
			status: "queued",
			position: queuePosition,
			input: prompt,
		});

		const queueMessage = new EmbedBuilder(client, interaction.locale)
			.setColor("#3498db")
			.setDescription("IMG_PROCESSING", {
				queuePosition,
				prompt,
			})
			.setTimestamp()
			.setFooter({
				text: "Powered by Huggingface using Skyndalex bot",
			});

		await interaction.reply({
			embeds: [queueMessage],
		});

		const response = await hf.textToImage({
			inputs: prompt,
			model: model,
			parameters: {
				negative_prompt: "blurry",
			},
		});

		const imageBuffer =
			(await response.arrayBuffer()) as HuggingFaceImage["generatedImage"];
		const image = new AttachmentBuilder(Buffer.from(imageBuffer));

		const deleteAttachment =
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder(client, interaction.locale)
					.setCustomId("deleteAttachment")
					.setLabel("AI_DELETE_ATTACHMENT")
					.setStyle(ButtonStyle.Danger),
			);
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
			.setColor("Green");

		await interaction.editReply({
			embeds: [embed],
			files: [image],
			components: [deleteAttachment],
		});
		await interaction.followUp({
			content: client.i18n.t("IMAGE_READY", {
				userId: interaction.user.id,
			}),
		});
	}
	imageQueue.delete(taskId);
}
export const data = {
	...new SlashCommandBuilder()
		.setName("genimg")
		.setDescription("Generate image")
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
		),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};

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

	const choices = json.slice(0, 25).map((model) => ({
		name: model.modelId,
		value: model.modelId,
	}));

	await interaction.respond(choices);
}
