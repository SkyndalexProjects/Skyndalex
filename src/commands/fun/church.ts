import {
	AttachmentBuilder,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { CanvasTextAlign, createCanvas, loadImage } from "@napi-rs/canvas";
import { join } from "path";
import { getLines } from "#utils";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();

	const text = interaction.options.getString("text", true);
	const imgPath = join(
		process.cwd(),
		"assets",
		"imgs",
		"empty_screen.png",
	);
	const img = await loadImage(imgPath);

	const width = img.width;
	const height = img.height;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	ctx.drawImage(img, 0, 0, width, height);

	ctx.font = "24px DotMatrix";
	ctx.textAlign = "center" as CanvasTextAlign;
	ctx.textBaseline = "middle";
	ctx.fillStyle = "#FFBE14";
	ctx.shadowColor = "#8e7267";
	ctx.shadowBlur = 12;

	const cleanText = text.replace(/,/g, "");

	const maxWidth = 260;
	const lineHeight = 22;

	const lines = getLines(ctx, cleanText, maxWidth);
	let startY = 160;

	for (const line of lines) {
		ctx.fillText(line, 330, startY);
		startY += lineHeight;
	}

	const buffer = canvas.toBuffer("image/png");
	const attachment = new AttachmentBuilder(buffer, { name: "screen.png" });
	await interaction.editReply({ files: [attachment] });
}

export const data = new SlashCommandBuilder()
	.setName("church")
	.setDescription("Display text on a church LED screen")
	.addStringOption((option) =>
		option.setName("text").setDescription("Text to display").setRequired(true),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
