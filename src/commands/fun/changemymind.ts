import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { GlobalFonts, createCanvas, loadImage } from "@napi-rs/canvas";
import { getLines } from "#utils";
import { join } from "path";

const canvas = createCanvas(384, 385);
const ctx = canvas.getContext("2d");

export async function run(
	_client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();
	const text = interaction.options.getString("text");
	if (!text) return;

	const imagePath = join(
		process.cwd(),
		"assets",
		"imgs",
		"change_my_mind.jpg",
	);

	const img = await loadImage(imagePath);

	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

	ctx.font = "20px Poppins-SemiBold";
	ctx.fillStyle = "black";
	ctx.textAlign = "left";

	const maxWidth = 225;
	const lineHeight = 22;

	const lines = getLines(ctx, text, maxWidth);
	let startY = 240;

	for (const line of lines) {
		ctx.fillText(line, 110, startY);
		startY += lineHeight;
	}

	const image = await canvas.encode("png");

	await interaction.editReply({
		files: [Buffer.from(image)],
	});
}

export const data = new SlashCommandBuilder()
	.setName("changemymind")
	.setDescription('Sends image with "Change my mind" meme!')
	.addStringOption((option) =>
		option
			.setName("text")
			.setDescription("Text to put on the image")
			.setRequired(true)
			.setMaxLength(80)
			.setMinLength(1),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
