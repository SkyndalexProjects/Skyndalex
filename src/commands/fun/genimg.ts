import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	MessageFlags,
	ButtonBuilder,
	ButtonStyle,
	TextDisplayBuilder,
	ContainerBuilder,
	ActionRowBuilder,
	AttachmentBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { Client } from "@gradio/client";
import { handleError } from "../../utils/index.js";
import * as process from "node:process";
import {
	HuggingFaceErrorData,
	HuggingFaceSpaceData,
} from "../../types/index.js";
import * as console from "node:console";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();
	const prompt = interaction.options.getString("prompt");
	const image = interaction.options.getAttachment("image");
	const imageBlob = image
		? await fetch(image.url).then((res) => res.blob())
		: null;
	console.log("Image attachment:", image);
	const getToken = await client.prisma.tokens.findUnique({
		where: {
			userId: interaction.user.id,
		},
	});

	if (
		!getToken ||
		!getToken.huggingFaceToken ||
		getToken.huggingFaceToken.length <= 0
	) {
		const authorizeButton = new ButtonBuilder()
			.setLabel("Authorize")
			.setStyle(ButtonStyle.Link)
			.setURL(
				process.env.OAUTH_TO_HUGGINGFACE ?? "https://default-auth-url.com",
			);
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			authorizeButton,
		);

		const container = new ContainerBuilder()
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent("Authorization required."),
			)
			.setAccentColor(0xffff00);

		return interaction.editReply({
			flags: MessageFlags.IsComponentsV2,
			components: [container, row],
		});
	}

	let defaultModel;
	let apiParameters;
	let apiEndpoint;

	if (imageBlob) {
		defaultModel = "OmniGen2/OmniGen2";
		apiParameters = {
			instruction: prompt,
			width_input: 1024,
			height_input: 1024,
			scheduler: "euler",
			num_inference_steps: 20,
			image_input_1: imageBlob,
			image_input_2: null,
			image_input_3: null,
			negative_prompt:
				"(((deformed))), blurry, over saturation, bad anatomy, disfigured, poorly drawn face, mutation, mutated, (extra_limb), (ugly), (poorly drawn hands), fused fingers, messy drawing, broken legs censor, censored, censor_bar",
			guidance_scale_input: 1,
			img_guidance_scale_input: 1,
			cfg_range_start: 0,
			cfg_range_end: 0,
			num_images_per_prompt: 1,
			max_input_image_side_length: 1024,
			max_pixels: 65536,
			seed_input: -1,
		};
		apiEndpoint = "/run";
	} else {
		defaultModel = "black-forest-labs/FLUX.1-dev";
		apiParameters = {
			prompt,
			seed: 0,
			randomize_seed: true,
			width: 1024,
			height: 1024,
			guidance_scale: 3.5,
			num_inference_steps: 28,
		};
		apiEndpoint = "/infer";
	}
	console.log("Using model:", defaultModel);
	const app = await Client.connect(defaultModel, {
		hf_token: getToken?.huggingFaceToken,
	}).catch((error: Error) => {
		console.error("Error connecting to HuggingFace:", error);
		handleError(client, error, interaction);
		return null;
	});

	const result: HuggingFaceSpaceData = await app
		.predict(apiEndpoint, apiParameters)
		.catch((error: HuggingFaceErrorData) => {
			console.log(error);
			if (error) {
				const authorizeButton = new ButtonBuilder()
					.setLabel("Authorize")
					.setStyle(ButtonStyle.Link)
					.setURL(
						process.env.OAUTH_TO_HUGGINGFACE ?? "https://default-auth-url.com",
					);
				const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
					authorizeButton,
				);

				let errorMessage =
					"The token you were using is already used up. To use the command again, you must log in via Huggingface. It is **free**, Skyndalex is in no way associated with this platform.";
				if (error.title === "ZeroGPU quota exceeded" && error.message) {
					const timeRegex = /Try again in (\d+):(\d+):(\d+)/;
					const timeMatch = error.message.match(timeRegex);
					if (timeMatch) {
						const hours = parseInt(timeMatch[1], 10);
						const minutes = parseInt(timeMatch[2], 10);
						const seconds = parseInt(timeMatch[3], 10);

						const resetTime = new Date();
						resetTime.setHours(resetTime.getHours() + hours);
						resetTime.setMinutes(resetTime.getMinutes() + minutes);
						resetTime.setSeconds(resetTime.getSeconds() + seconds);

						const unixTimestamp = Math.floor(resetTime.getTime() / 1000);

						const quotaRegex = /\((\d+s requested vs\. \d+s left)\)/;
						const quotaMatch = error.message.match(quotaRegex);
						const quotaInfo = quotaMatch ? quotaMatch[1] : "";

						errorMessage =
							`**ZeroGPU quota exceeded**\nUsage ${quotaInfo}\n` +
							`Renewal: <t:${unixTimestamp}:R> (<t:${unixTimestamp}:F>)\n\n` +
							`To continue, you must wait for the quota to reset or upgrade your Huggingface account. You can also try again later.`;
					} else {
						console.error(error);
						errorMessage = `**ZeroGPU quota exceeded**\n${error.message}\n\n…`;
					}
				}

				const container = new ContainerBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(errorMessage),
					)
					.setAccentColor(0xffff00);

				return interaction.editReply({
					flags: MessageFlags.IsComponentsV2,
					components: [container, row],
				});
			}
		});

	if (result?.data) {
		const deleteButton = new ButtonBuilder()
			.setCustomId("delete-button")
			.setLabel("Delete")
			.setStyle(ButtonStyle.Danger);

		const regenerate = new ButtonBuilder()
			.setCustomId("regenerate")
			.setLabel("Regenerate")
			.setStyle(ButtonStyle.Primary);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			deleteButton,
			regenerate,
		);

		const imageResponse = await fetch(result.data[0].url);
		const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
		const attachment = new AttachmentBuilder(imageBuffer, {
			name: "generated-image.png",
		});

		await interaction.editReply({
			content: `**${prompt}** - Generated by **${interaction.user.username}**\n-# Prompting tips [here](<https://github.com/VectorSpaceLab/OmniGen2?tab=readme-ov-file#-usage-tips>)`,
			components: [row],
			files: [attachment],
		});
	} else {
		return null;
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
	.addAttachmentOption((option) =>
		option
			.setName("image")
			.setDescription("An image to use as a reference for the generation"),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
