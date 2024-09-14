import { HfInference } from "@huggingface/inference";
import {
	ActionRowBuilder,
	AttachmentBuilder,
	type AutocompleteInteraction,
	type BaseGuildTextChannel,
	ButtonStyle,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { handleError } from "#utils";
import { ButtonBuilder, EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import type { HuggingFaceImage, HuggingFaceSearchResult } from "#types";
import { suggestCommands } from "#utils";
const hf = new HfInference(process.env.HF_TOKEN);

const imageQueue = new Map();

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const taskId = `${interaction.user.id}-${Date.now()}`;

	try {
		const prompt = interaction.options.getString("prompt");
		const defaultModel = "stabilityai/stable-diffusion-2-1";
		const model = interaction?.options?.getString("model") || defaultModel;

		const queuePosition = imageQueue.size + 1;

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

			if (!interaction.deferred && !interaction.replied) {
				const embed = new EmbedBuilder(client, interaction.locale)
					.setDescription("SYSTEM_UNKOWN_ERROR")
					.setColor("Red");
				return interaction.editReply({ embeds: [embed] });
			}

			if (!response) {
				const embed = new EmbedBuilder(client, interaction.locale)
					.setDescription("IMG_ERROR")
					.setColor("Red");
				return interaction.editReply({ embeds: [embed] });
			}

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
		}
		imageQueue.delete(taskId);

		const commands = await suggestCommands(client, interaction.user.id);

		if (!commands) return;

		await interaction.followUp({
			content: client.i18n.t("SUGGESTED_COMMANDS", {
				lng: interaction.locale,
				commands: commands.join(" "),
			}),
			ephemeral: true,
		});
	} catch (e) {
		console.error(e);
		imageQueue.delete(taskId);

		await handleError(client, e, interaction);
	}
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
		)
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
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
