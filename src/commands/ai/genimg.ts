import { performance } from "node:perf_hooks";
import * as process from "node:process";
import { Client } from "@gradio/client";
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ContainerBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	TextDisplayBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/index.js";
import type {
	HuggingFaceErrorData,
	HuggingFaceSpaceData,
} from "../../types/index.js";

const FALLBACK_IMAGE_URL = "https://picsum.photos/768/768";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const getDiscordAccounts = await client.prisma.account.findFirst({
		where: {
			accountId: interaction.user.id,
			providerId: "discord",
		},
	});

	if (
		!getDiscordAccounts?.accessToken ||
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
				new TextDisplayBuilder().setContent(
					"**Authorization required.**",
				),
				new TextDisplayBuilder().setContent(
					'> ℹ️ | After clicking "Authorize", you will be redirected to the *bot dashboard.*\n\n> ℹ️ | It should automatically login you with Discord, and then you will need to *click button on the center of the website* to link your account with Huggingface platform.\n\n> ℹ️ It all should take a *few seconds* (If you are already logged in, everything happens instantly)',
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

		console.log("Huggingface account", getHuggingfaceAccount);

		await interaction.deferReply();

		const prompt = interaction.options.getString("prompt", true);

		const defaultModel = "black-forest-labs/FLUX.1-schnell";

		const apiParameters = {
			prompt,
			seed: 0,
			randomize_seed: true,
			width: 768,
			height: 768,
			num_inference_steps: 4,
		};

		let app: Awaited<ReturnType<typeof Client.connect>>;

		try {
			app = await Client.connect(defaultModel, {
				hf_token: getHuggingfaceAccount?.accessToken,
			});
		} catch (error: unknown) {
			console.error("Error connecting to HuggingFace:", error);

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

			const container = new ContainerBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						"**HuggingFace space is unavailable right now.**\nPlease try again in a moment. If this keeps happening, re-authorize your HuggingFace account.",
					),
				)
				.setAccentColor(0xffff00);

			await interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container, row],
			});

			return;
		}

		let result: HuggingFaceSpaceData | null = null;
		let elapsed = 0;

		try {
			const start = performance.now();

			result = (await app.predict(
				"/infer",
				apiParameters,
			)) as HuggingFaceSpaceData;

			elapsed = performance.now() - start;
		} catch (error: unknown) {
			console.error(error);

			const hfError = error as Partial<HuggingFaceErrorData>;

			if (hfError.title === "ZeroGPU quota exceeded") {
				console.log(
					"ZeroGPU quota exceeded - using fallback image instead of failing the command.",
				);

				const start = performance.now();

				result = {
					data: [{ url: FALLBACK_IMAGE_URL }],
				} as HuggingFaceSpaceData;

				elapsed = performance.now() - start;
			} else {
				const authorizeButton = new ButtonBuilder()
					.setLabel("Authorize")
					.setStyle(ButtonStyle.Link)
					.setURL(
						process.env.OAUTH_TO_HUGGINGFACE ??
						"https://default-auth-url.com",
					);

				const row =
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						authorizeButton,
					);

				const errorMessage = `**Error occurred**\n${
					hfError.message ?? "Unknown error"
				}\n\n...`;

				const container = new ContainerBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(errorMessage),
					)
					.setAccentColor(0xffff00);

				await interaction.editReply({
					flags: MessageFlags.IsComponentsV2,
					components: [container, row],
				});

				return;
			}
		}

		if (result?.data) {
			const imageResponse = await fetch(result.data[0].url);
			const imageBuffer = Buffer.from(
				await imageResponse.arrayBuffer(),
			);

			const attachment = new AttachmentBuilder(imageBuffer, {
				name: "generated-image.png",
			});

			const generatedMessage = new TextDisplayBuilder().setContent(
				`\`Took ${elapsed.toFixed(0)} ms\` - **${prompt}**`,
			);

			// TODO:
			// const imageRarity = [
			//     "COMMON",
			//     "UNCOMMON",
			//     "RARE",
			//     "EPIC",
			//     "LEGENDARY",
			// ];
			// const baseValue = 100;
			// const multiplier = 2.5;
			// const rarity =
			//     imageRarity[Math.floor(Math.random() * imageRarity.length)];

			// const imageValue = Math.round(
			//     baseValue * Math.pow(
			//         multiplier,
			//         imageRarity.indexOf(rarity),
			//     ),
			// );

			// const collectible = await client.prisma.collectible.create({
			//     data: {
			//         userId: interaction.user.id,
			//         imageUrl: "https://picsum.photos/768/768",
			//         prompt,
			//         rarity,
			//         value: BigInt(imageValue),
			//         status: "PENDING",
			//         expiresAt: new Date(Date.now() + 10 * 60 * 1000),
			//     },
			// });

			const deleteButton = new ButtonBuilder()
				.setCustomId("delete-button")
				.setLabel("Delete")
				.setStyle(ButtonStyle.Danger);

			const regenerate = new ButtonBuilder()
				.setCustomId("regenerate")
				.setLabel("Regenerate")
				.setStyle(ButtonStyle.Primary);

			/*
            const collect = new ButtonBuilder()
                .setCustomId(`collect-${collectible.id}`)
                .setLabel("Collect")
                .setStyle(ButtonStyle.Primary);
            */

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				deleteButton,
				regenerate,
				// collect,
			);

			//
			// const stats = new TextDisplayBuilder().setContent(
			//     `\`\`\`💎 Rarity: ${rarity}\n` +
			//     `💰 Value: ${imageValue}\n\`\`\``,
			// );

			// const info = new TextDisplayBuilder().setContent(
			//     `\n-# ℹ️ | Your image is your **collectible**. Check your collectibles in \`/inventory\`. ` +
			//     `You can use it in \`/duel\`, sell it, have in profile and more options coming soon`,
			// );

			const separator = new SeparatorBuilder().setSpacing(
				SeparatorSpacingSize.Large,
			);

			const image = new MediaGalleryBuilder().addItems(
				new MediaGalleryItemBuilder().setURL(
					"attachment://generated-image.png",
				),
			);

			const container = new ContainerBuilder()
				.addTextDisplayComponents(generatedMessage)
				// .addTextDisplayComponents(stats)
				.addSeparatorComponents(separator)
				.addMediaGalleryComponents(image)
				.addSeparatorComponents(separator)
				// .addTextDisplayComponents(info)
				.addSeparatorComponents(separator)
				.addActionRowComponents(row);

			await interaction.editReply({
				flags: MessageFlags.IsComponentsV2,
				components: [container],
				files: [attachment],
			});
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
	.addAttachmentOption((option) =>
		option
			.setName("image")
			.setDescription(
				"An image to use as a reference for the generation",
			),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);