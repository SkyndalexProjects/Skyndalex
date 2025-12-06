import {
	AttachmentBuilder,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { CanvasTextAlign, createCanvas, loadImage } from "@napi-rs/canvas";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();

	const text = interaction.options.getString("status", true);
	const user = interaction.options.getUser("user", true);

	const avatarURL = user.displayAvatarURL({ extension: "png", size: 128 });
	const avatar = await loadImage(avatarURL);

	// TODO: draw rectangle instea of loading image file, refactor code as it is in fake.ts or better

	const imgPath = join(
		__dirname,
		"..",
		"..",
		"assets",
		"imgs",
		"fakestatus.png",
	);
	const img = await loadImage(imgPath);

	const width = img.width;
	const height = img.height;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	ctx.drawImage(img, 0, 0, width, height);

	const avatarX = 10;
	const avatarY = 5;
	const avatarSize = 30;
	const avatarRadius = avatarSize / 2;

	ctx.save();
	ctx.beginPath();
	ctx.arc(
		avatarX + avatarRadius,
		avatarY + avatarRadius,
		avatarRadius,
		0,
		Math.PI * 2,
	);
	ctx.closePath();
	ctx.clip();
	ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
	ctx.restore();

	const member = interaction.guild?.members.cache.get(user.id);

	const dotRadius = 4;
	const dotX = avatarX + avatarSize - dotRadius;
	const dotY = avatarY + avatarSize - dotRadius;

	ctx.beginPath();
	ctx.arc(dotX, dotY, dotRadius + 3, 0, Math.PI * 2);
	ctx.fillStyle = "#232428"; // Match your background color
	ctx.fill();

	ctx.beginPath();
	ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
	ctx.fillStyle = "#43b581";
	ctx.fill();

	const roleColor = member?.displayHexColor ?? "#ffffff";

	const leftX = 50;
	const startY = 3;

	const displayName = member?.displayName ?? user.username;
	const cleanName = String(displayName).replace(/,/g, "");
	ctx.font = "16px ggsans";
	ctx.textAlign = "left" as CanvasTextAlign;
	ctx.textBaseline = "top";
	ctx.fillStyle = roleColor;
	ctx.strokeStyle = "transparent";
	ctx.lineWidth = 2;
	ctx.strokeText(cleanName, leftX, startY);
	ctx.fillText(cleanName, leftX, startY);

	ctx.font = "12px ggsans";
	ctx.fillStyle = "#9aa0a6";
	ctx.textBaseline = "top";

	const maxWidth = width - leftX - 10;
	const lineHeight = 14;
	const statusStartY = startY + 20;

	let y = statusStartY;
	const words = String(text).split(" ");
	let line = "";
	for (let n = 0; n < words.length; n++) {
		const testLine = line ? line + " " + words[n] : words[n];
		const metrics = ctx.measureText(testLine);
		if (metrics.width > maxWidth && line) {
			ctx.fillText(line, leftX, y);
			y += lineHeight;
			line = words[n];
		} else {
			line = testLine;
		}
	}
	if (line) ctx.fillText(line, leftX, y);

	const buffer = canvas.toBuffer("image/png");
	const attachment = new AttachmentBuilder(buffer, { name: "screen.png" });
	await interaction.editReply({ files: [attachment] });
}

export const data = new SlashCommandBuilder()
	.setName("fakestatus")
	.setDescription("Generate fake.ts user status")
	.addStringOption((option) =>
		option
			.setName("status")
			.setDescription("Status text to display")
			.setRequired(true),
	)
	.addUserOption((option) =>
		option
			.setName("user")
			.setDescription("User to display the status for")
			.setRequired(true),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
