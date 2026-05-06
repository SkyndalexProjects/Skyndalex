import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	ContainerBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	MessageFlags,
	TextDisplayBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	AttachmentBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import * as process from "node:process";

const INVOKE_URL =
	"https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-medium";
const VARIANT_COUNT = 4;
const LOADING_ICON = "<a:4704loadingicon:1183416396223352852>";

const AI_FACTS = [
	"AI image models do not truly understand meaning; they predict pixels from learned patterns.",
	"The same prompt with different seeds can produce very different compositions.",
	"Short prompts are fast to test, but adding style and lighting details improves control.",
	"A negative prompt can help reduce unwanted artifacts in generated images.",
	"Most generative models are sensitive to word order and emphasis.",
	"Diffusion models iteratively denoise random noise into coherent images.",
	"Aspect ratio choices change composition quality as much as prompt wording.",
	"Generated images can contain mistakes in text, hands, and tiny details.",
	"Seed values make image generations reproducible when settings stay the same.",
	"Model safety filters can block outputs that look unsafe or policy-sensitive.",
];
//TODO: add 10-images limit for one queue

interface NvidiaApiResponse {
	image: string;
}

interface QueueItem {
	interaction: ChatInputCommandInteraction;
	prompt: string;
	fact: string;
}

export interface GenimgSession {
	ownerId: string;
}

const queue: QueueItem[] = [];
const gallerySessions = new Map<string, GenimgSession>();
let isQueueProcessing = false;

function buildQueueMessage(
	position: number,
	fact: string,
	prompt: string,
): string {
	return [
		`${LOADING_ICON} **Image request queued**`,
		`**Position:** ${position}`,
		`**Prompt:** ${prompt}`,
		`-# ${fact}`,
	].join("\n");
}

function buildProcessingMessage(fact: string, prompt: string): string {
	return [
		`${LOADING_ICON} **Generating multiple variants...**`,
		`**Prompt:** ${prompt}`,
		`-# AI fact: ${fact}`,
	].join("\n");
}

const deleteButton = new ButtonBuilder()
	.setCustomId("delete-button")
	.setLabel("Delete")
	.setStyle(ButtonStyle.Danger);

const row = new ActionRowBuilder<ButtonBuilder>().addComponents(deleteButton);

function buildGalleryContainer(
	prompt: string,
	requesterName: string,
	fileNames: string[],
) {
	const mediaGallery = new MediaGalleryBuilder().addItems(
		fileNames.map((fileName, index) =>
			new MediaGalleryItemBuilder()
				.setURL(`attachment://${fileName}`)
				.setDescription(`Variant ${index + 1}`),
		),
	);

	return new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`### ${prompt}`),
		)
		.addMediaGalleryComponents(mediaGallery)
		.addActionRowComponents(row);
}

async function generateVariant(prompt: string, seed: number): Promise<Buffer> {
	const response = await fetch(INVOKE_URL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt,
			cfg_scale: 5,
			aspect_ratio: "16:9",
			seed,
			steps: 50,
			negative_prompt: "",
		}),
	});

	if (response.status !== 200) {
		const errBody = await response.text();
		throw new Error(`Image generation failed (${response.status}): ${errBody}`);
	}

	const responseBody = (await response.json()) as NvidiaApiResponse;
	return Buffer.from(responseBody.image, "base64");
}

async function generateVariants(prompt: string): Promise<Buffer[]> {
	const baseSeed = Math.floor(Math.random() * 1_000_000);
	const variants: Buffer[] = [];

	for (let i = 0; i < VARIANT_COUNT; i++) {
		variants.push(await generateVariant(prompt, baseSeed + i));
	}

	return variants;
}

async function updateQueuedPositions(): Promise<void> {
	const waitingItems = isQueueProcessing ? queue.slice(1) : queue;
	for (const [index, item] of waitingItems.entries()) {
		const position = index + (isQueueProcessing ? 2 : 1);
		await item.interaction
			.editReply({
				content: buildQueueMessage(position, item.fact, item.prompt),
				components: [],
			})
			.catch(() => null);
	}
}

async function processQueue(): Promise<void> {
	if (isQueueProcessing) return;
	isQueueProcessing = true;

	while (queue.length > 0) {
		const item = queue[0];
		await item.interaction
			.editReply({
				content: buildProcessingMessage(item.fact, item.prompt),
				components: [],
			})
			.catch(() => null);

		try {
			const variants = await generateVariants(item.prompt);
			const attachments = variants.map(
				(buffer, index) =>
					new AttachmentBuilder(buffer, {
						name: `generated-image-${index + 1}.jpg`,
					}),
			);
			const fileNames = attachments.map(
				(attachment, index) =>
					attachment.name ?? `generated-image-${index + 1}.jpg`,
			);

			const reply = await item.interaction.editReply({
				content: "",
				flags: MessageFlags.IsComponentsV2,
				components: [
					buildGalleryContainer(
						item.prompt,
						item.interaction.user.username,
						fileNames,
					),
				],
				files: attachments,
			});

			gallerySessions.set(reply.id, { ownerId: item.interaction.user.id });
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Unexpected image generation error.";
			await item.interaction
				.editReply({
					content: `Image generation failed: ${errorMessage}`,
					components: [],
				})
				.catch(() => null);
		}

		queue.shift();
		await updateQueuedPositions();
	}

	isQueueProcessing = false;
}

export async function run(
	_client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();

	const prompt = interaction.options.getString("prompt", true).trim();
	const fact = AI_FACTS[Math.floor(Math.random() * AI_FACTS.length)];
	const queueItem: QueueItem = { interaction, prompt, fact };
	queue.push(queueItem);

	await interaction.editReply({
		content: buildQueueMessage(queue.length, fact, prompt),
		components: [],
	});

	await updateQueuedPositions();
	void processQueue();
}
//TODO: when nvidia api down, use huggingface api

/*
const getDiscordAccounts = await client.prisma.account.findFirst({
		where: {
			accountId: interaction.user.id,
			providerId: "discord",
		},
	});

	if (
		!getDiscordAccounts ||
		!getDiscordAccounts.accessToken ||
		getDiscordAccounts.accessToken.length <= 0
	) {
		const authorizeButton = new ButtonBuilder()
			.setLabel("Authorize")
			.setStyle(ButtonStyle.Link)
			.setURL(process.env.OAUTH_TO_HUGGINGFACE as string);
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			authorizeButton,
		);

		const container = new ContainerBuilder()
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent("\**Authorization required.\**"),
				new TextDisplayBuilder().setContent(
					'> ℹ️ | After clicking "Authorize", you will be redirected to the \*bot dashboard.\*\n\n> ℹ️ | It should automatically login you with Discord, and then you will need to \*click button on the center of the website\* to link your account with Huggingface platform.\n\n> ℹ️ It all should take a \*few seconds\* (If you are already logged in, everything happens instantly)',
				),
			)
			.setAccentColor(0xffff00);

		return interaction.reply({
			flags: MessageFlags.IsComponentsV2,
			components: [container, row],
		});
	}

	if (getDiscordAccounts) {
		const getHuggingfaceAccount = await client.prisma.account.findFirst({
			where: {
				userId: getDiscordAccounts.userId,
				providerId: "huggingface",
			},
		});

		console.log("Huggingface account", getHuggingfaceAccount)
		await interaction.deferReply();
		const prompt = interaction.options.getString("prompt");
		const image = interaction.options.getAttachment("image");
		const imageBlob = image
			? await fetch(image.url).then((res) => res.blob())
			: null;

		let defaultModel;
		let apiParameters;

		if (imageBlob) {
			defaultModel = "black-forest-labs/FLUX.2-dev";
			apiParameters = {
				prompt,
				input_images: [],
				seed: 0,
				randomize_seed: true,
				width: 1024,
				height: 1024,
				num_inference_steps: 30,
				guidance_scale: 4,
				prompt_upsampling: true,
			};
		} else {
			defaultModel = "black-forest-labs/FLUX.1-dev";
			apiParameters = {
				prompt,
				seed: 0,
				randomize_seed: true,
				width: 1024,
				height: 1024,
				num_inference_steps: 30,
				guidance_scale: 4,
			};
		}

		const app = await Client.connect(defaultModel, {
			hf_token: getHuggingfaceAccount?.accessToken,
		}).catch((error: Error) => {
			console.error("Error connecting to HuggingFace:", error);
			handleError(client, error, interaction);
			return null;
		});

		const result: HuggingFaceSpaceData = await app
			.predict("/infer", apiParameters)
			.catch((error: HuggingFaceErrorData) => {
				console.log(error);
				if (error) {
					const authorizeButton = new ButtonBuilder()
						.setLabel("Authorize")
						.setStyle(ButtonStyle.Link)
						.setURL(
							process.env.OAUTH_TO_HUGGINGFACE ??
								"https://default-auth-url.com",
						);
					const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
						authorizeButton,
					);

					let errorMessage =
						"The token you were using is already used up. To use the command again, you must log in via Huggingface. It is **free**, Skyndalex is in no way associated with this platform.";


					if (error.title === "ZeroGPU quota exceeded") {
						const match = error.message?.match(/Try again in (\d{1,2}):(\d{2}):(\d{2})/);
						if (match) {
							const [, hours, minutes, seconds] = match.map(Number);
							const now = Math.floor(Date.now() / 1000);
							const resetTimestamp = now + hours * 3600 + minutes * 60 + seconds;
							const discordTimestamp = `<t:${resetTimestamp}:R>`; // Relative time
							errorMessage =
								`**ZeroGPU quota exceeded**\n` +
								`To continue, you must wait for the quota to reset ${discordTimestamp} or upgrade your Huggingface account. You can also try again later or use a different account.`;
						}
					} else {
						console.error(error);
						errorMessage = `**Error occurred**\n${error.message || "Unknown error"}\n\n...`;
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
				content: `**${prompt}** - Generated by **${interaction.user.username}**\n-# :exclamation: | Please monitor your zeroGPU usage [here](<https://huggingface.co/settings/billing>). If guild is using daily image generator, you don't want to exceed your limit before daily generates.\n-# :ok_hand:  | Are you enjoying the bot? Consider voting [here](<https://top.gg/bot/${client.user!.id}/vote>) to help us grow!`,
				components: [row],
				files: [attachment],
			});
		} else {
			return null;
		}
	}
 */

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
