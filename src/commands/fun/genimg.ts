import {
	ActionRowBuilder,
	AttachmentBuilder,
	type AutocompleteInteraction,
	type BaseGuildTextChannel,
	ButtonStyle,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { ButtonBuilder, EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import type { HuggingFaceImage, HuggingFaceSearchResult } from "#types";
import { handleError, suggestCommands } from "#utils";

const imageQueue = new Map();

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const taskId = `${interaction.user.id}-${Date.now()}`;
	const defaultModel = "stabilityai/stable-diffusion-2-1";
	const model = interaction?.options?.getString("model") || defaultModel;
	const settings = await client.prisma.settings.findFirst({
		where: {
			guildId: interaction.guildId,
		},
	});

	try {
		const prompt = interaction.options.getString("prompt");

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

			const response = await fetch(
				`https://api-inference.huggingface.co/models/${model}`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${
							settings?.huggingFaceToken || process.env.HF_TOKEN
						}`,
						"Content-Type": "application/json",
						"x-wait-for-model": "true",
					},
					body: JSON.stringify({
						inputs: prompt,
					}),
				},
			);

			if (!interaction.deferred && !interaction.replied) {
				const embed = new EmbedBuilder(client, interaction.locale)
					.setDescription("SYSTEM_UNKOWN_ERROR")
					.setColor("Red");
				return interaction.editReply({ embeds: [embed] });
			}

			if (!response.ok) {
				const embed = new EmbedBuilder(client, interaction.locale)
					.setDescription("IMG_ERROR")
					.setColor("Red");
				return interaction.editReply({ embeds: [embed] });
			}

			const result =
				(await response.blob()) as HuggingFaceImage["generatedImage"];

			const imageBuffer = Buffer.from(await result.arrayBuffer());
			const image = new AttachmentBuilder(imageBuffer, {
				name: "image.jpg",
			});

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
						model,
					}),
				)
				.setFooter({
					text: "IMG_GENERATED_NSFW_WARNING",
				})
				.setColor("Green");

			await interaction.editReply({
				embeds: [embed],
				components: [deleteAttachment],
				files: [image],
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

		if (!interaction.deferred && !interaction.replied) {
			await interaction.reply({
				content: client.i18n.t("AI_MODEL_NOT_RESPONDING", {
					lng: interaction.locale,
					model: interaction.options.getString("model") || model,
				}),
				ephemeral: true,
			});
		} else {
			await handleError(client, e, interaction);
		}
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
