import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { getLines } from "#utils";
const canvas = createCanvas(384, 385);
const ctx = canvas.getContext("2d");

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();
	const text = interaction.options.getString("text");
	const imagePath = new URL(
		"../../../assets/images/ChangeMyMind.jpg",
		import.meta.url,
	).pathname;
	const fontPath = new URL("../../../assets/fonts/Poppins-SemiBold.ttf", import.meta.url).pathname;
	GlobalFonts.registerFromPath(fontPath, "Poppins-SemiBold");
	
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

export const data = {
	...new SlashCommandBuilder()
		.setName("changemymind")
		.setDescription('Generate image with "Change my mind" meme!')
		.addStringOption((option) =>
			option
				.setName("text")
				.setDescription("Text to put on the image")
				.setRequired(true)
				.setMaxLength(80)
				.setMinLength(1),
		)
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
};
