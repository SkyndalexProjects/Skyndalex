import { createCanvas, loadImage } from "canvas";
import type { SkyndalexClient } from "classes/Client";
import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	AttachmentBuilder,
} from "discord.js";
import { getLines } from "utils/getLines";
const canvas = createCanvas(384, 385);
const ctx = canvas.getContext("2d");

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();
	const text = interaction.options.getString("text");
	const imagePath = new URL(
		"../../../assets/images/changemymind.jpg",
		import.meta.url,
	).pathname;
	const img = await loadImage(imagePath);

	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

	ctx.font = "18px Arial";
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

	const image = new AttachmentBuilder(canvas.toBuffer(), {
		name: "changemymind.png",
	});

	await interaction.editReply({
		files: [image],
	});
}


export const data = new SlashCommandBuilder()
	.setName("changemymind")
	.setDescription('Generate image with "Change my mind" meme!')
	.addStringOption((option) =>
		option
			.setName("text")
			.setDescription("Text to put on the image")
			.setRequired(true)
			.setMaxLength(80)
			.setMinLength(1)
	);
