import {
	AttachmentBuilder,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { CanvasTextAlign, createCanvas, loadImage } from "@napi-rs/canvas";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { getLines } from "../../utils/getLines.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();

	const text = interaction.options.getString("text", true);
	const imgPath = join(
		__dirname,
		"..",
		"..",
		"assets",
		"imgs",
		"daily_mail.png",
	);
	const img = await loadImage(imgPath);

	const width = img.width;
	const height = img.height;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	ctx.drawImage(img, 0, 0, width, height);

	ctx.font = "24px MyriadPro";
	ctx.textAlign = "left" as CanvasTextAlign;
	ctx.textBaseline = "top";
	ctx.fillStyle = "#000000";
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 2;

	const cleanText = text.replace(/,/g, "");

	const leftX = 10;
	const maxWidth = 370;
	const lineHeight = 28;

	const lines = getLines(ctx, cleanText, maxWidth);
	let startY = 80;

	for (const line of lines) {
		ctx.strokeText(line, leftX, startY);
		ctx.fillText(line, leftX, startY);
		startY += lineHeight;
	}

	const buffer = canvas.toBuffer("image/png");
	const attachment = new AttachmentBuilder(buffer, { name: "screen.png" });
	await interaction.editReply({ files: [attachment] });
}

export const data = new SlashCommandBuilder()
	.setName("daily_mail")
	.setDescription("Display text on a daily mail")
	.addStringOption((option) =>
		option.setName("text").setDescription("Text to display").setRequired(true),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
