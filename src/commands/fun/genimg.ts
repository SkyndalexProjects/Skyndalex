import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	MediaGalleryBuilder,
	MessageFlags,
	ButtonBuilder,
	ButtonStyle,
	TextDisplayBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	ActionRowBuilder,
	SectionBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { Client } from "@gradio/client";
import { handleError } from "../../utils/index.js";
import * as process from "node:process";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	try {
		await interaction.deferReply();

		const prompt = interaction.options.getString("prompt");
		const negative_prompt = interaction.options.getString("negative_prompt");
		const style = interaction.options.getString("style") || "2560 x 1440";

		const getToken = await client.prisma.tokens.findUnique({
			where: {
				userId: interaction.user.id,
			},
		});
		if (!getToken?.huggingFaceToken) {
			const authorizeButton = new ButtonBuilder()
				.setLabel("Authorize")
				.setStyle(ButtonStyle.Link)
				.setURL(
					process.env.OAUTH_TO_HUGGINGFACE ?? "https://default-auth-url.com",
				);
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				authorizeButton,
			);

			const container = new ContainerBuilder().addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					"You need to authorize to use this command.",
				),
			);

			return interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container, row],
			});
		}
		console.log("getToken", getToken);
		console.log("negative_prompt", negative_prompt);
		console.log("style", style);

		const app = await Client.connect("Dagfinn1962/Midjourney-Free", {
			hf_token: getToken?.huggingFaceToken,
		});

		const hasNegativePrompt = negative_prompt !== null;

		const result = await app.predict("/run", {
			prompt,
			negative_prompt,
			use_negative_prompt: hasNegativePrompt,
			style,
			seed: 0,
			width: 1024,
			height: 1024,
			guidance_scale: 0.1,
			randomize_seed: true,
		});
		console.log("result", result.data[0][0].image);

		if (result && result.data && result.data[0][0].image) {
			const title = new TextDisplayBuilder().setContent(
				`**Image Generation Result**`,
			);
			const description = new TextDisplayBuilder().setContent(
				`I have generated an image, if something doesn't suit you or has been generated incorrectly, you always have the rights to the Delete button`,
			);

			const detailsTitle = new TextDisplayBuilder().setContent(
				"**Prompt Details**",
			);
			const details = new TextDisplayBuilder().setContent(
				`📝 | Prompt: "**${prompt}**"\n🖼️ | Style: **${style}**\n📘 | Negative Prompt: **${negative_prompt}**`,
			);

			const separator = new SeparatorBuilder().setSpacing(
				SeparatorSpacingSize.Large,
			);
			const media = new MediaGalleryBuilder({
				items: [
					{
						description: "Generated Image",
						media: {
							url: result.data[0][0].image.url,
						},
					},
				],
			});
			const deleteButton = new ButtonBuilder()
				.setCustomId("delete")
				.setLabel("Delete")
				.setStyle(ButtonStyle.Danger);

			const downloadButton = new ButtonBuilder()
				.setLabel("Download")
				.setStyle(ButtonStyle.Link)
				.setURL(result.data[0][0].image.url);

			const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
				deleteButton,
				downloadButton,
			);

			const container = new ContainerBuilder()
				.addTextDisplayComponents(title, description)
				.addSeparatorComponents(separator)
				.addTextDisplayComponents(detailsTitle)
				.addTextDisplayComponents(details)
				.addSeparatorComponents(separator)
				.addMediaGalleryComponents(media)
				.addSeparatorComponents(separator)
				.addActionRowComponents(actionRow);

			await interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container],
			});
		} else {
			await handleError(
				client,
				new Error("No image data returned from the model."),
				interaction,
			);
		}
	} catch (error) {
		console.error("Image generation error:", error);

		if (interaction.deferred || interaction.replied) {
			await handleError(
				client,
				new Error("An error occurred while generating the image."),
				interaction,
			);
		} else {
			await handleError(
				client,
				new Error("An error occurred while generating the image."),
				interaction,
			);
		}
	}
}

export const data = new SlashCommandBuilder()
	.setName("genimg")
	.setDescription("Generate an image using AI!")
	.addStringOption((option) =>
		option
			.setName("prompt")
			.setDescription("Describe the image you want to generate")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option.setName("negative_prompt").setDescription("Negative prompt"),
	)
	.addStringOption((option) =>
		option
			.setName("style")
			.setDescription("Set style for a image")
			.addChoices(
				{ name: "2560 x 1440", value: "2560 x 1440" },
				{ name: "Photo", value: "Photo" },
				{ name: "Cinematic", value: "Cinematic" },
				{ name: "Anime", value: "Anime" },
				{ name: "3D Model", value: "3d_model" },
			),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
