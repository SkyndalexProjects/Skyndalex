import {
	type CanvasTextAlign,
	createCanvas,
	loadImage,
	type SKRSContext2D,
} from "@napi-rs/canvas";
import {
	AttachmentBuilder,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	type User,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { getLines } from "#utils";

const canvasConfig = {
	minWidth: 400,
	maxWidth: 900,

	avatar: {
		x: 16,
		y: 16,
		size: 40,
	},

	text: {
		initialY: 16,
		topOffset: 25,
		lineHeight: 22,
		leftX: 72,
		rightPadding: 24,
	},

	fonts: {
		name: "600 16px 'gg sans', 'Segoe UI', sans-serif",
		time: "12px 'gg sans', 'Segoe UI', sans-serif",
		message: "400 16px 'gg sans', 'Segoe UI', sans-serif",
	},

	colors: {
		background: "#313338",
		text: "#dbdee1",
		time: "#949ba4",
		defaultRole: "#f2f3f5",
	},

	padding: {
		bottom: 12,
		time: 8,
	},
};

function calculateDimensions(text: string) {
	const tempCanvas = createCanvas(1000, 500);
	const ctx = tempCanvas.getContext("2d");

	ctx.font = canvasConfig.fonts.message;

	const words = text.split(" ");
	let currentLine = "";
	let maxWidth = 0;

	for (const word of words) {
		const testLine = `${currentLine + word} `;
		const width = ctx.measureText(testLine).width;

		if (width > canvasConfig.maxWidth - canvasConfig.text.leftX) {
			maxWidth = Math.max(maxWidth, ctx.measureText(currentLine).width);
			currentLine = `${word} `;
		} else {
			currentLine = testLine;
		}
	}

	maxWidth = Math.max(maxWidth, ctx.measureText(currentLine).width);

	const width = Math.min(
		canvasConfig.maxWidth,
		Math.max(
			canvasConfig.minWidth,
			maxWidth + canvasConfig.text.leftX + canvasConfig.text.rightPadding,
		),
	);

	const maxTextWidth =
		width - canvasConfig.text.leftX - canvasConfig.text.rightPadding;

	const lines = getLines(ctx, text, maxTextWidth);

	const textStartY = canvasConfig.text.initialY + canvasConfig.text.topOffset;

	const height =
		textStartY +
		lines.length * canvasConfig.text.lineHeight +
		canvasConfig.padding.bottom;

	const finalHeight = Math.max(
		height,
		canvasConfig.avatar.y +
			canvasConfig.avatar.size +
			canvasConfig.padding.bottom,
	);

	return { width, height: finalHeight, lines };
}

async function drawAvatar(ctx: SKRSContext2D, user: User) {
	const { x, y, size } = canvasConfig.avatar;
	const radius = size / 2;

	const avatarURL = user.displayAvatarURL({ extension: "png", size: 128 });
	const avatar = await loadImage(avatarURL);

	ctx.save();
	ctx.beginPath();
	ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
	ctx.closePath();
	ctx.clip();
	ctx.drawImage(avatar, x, y, size, size);
	ctx.restore();
}

function drawBackground(ctx: SKRSContext2D, width: number, height: number) {
	ctx.fillStyle = canvasConfig.colors.background;
	ctx.fillRect(0, 0, width, height);
}

async function drawUserInfo(
	ctx: SKRSContext2D,
	user: User,
	interaction: ChatInputCommandInteraction,
) {
	const member = interaction.guild?.members.cache.get(user.id);
	const displayName = (member?.displayName ?? user.username).replace(/,/g, "");

	const roleColor =
		member?.displayHexColor && member.displayHexColor !== "#000000"
			? member.displayHexColor
			: canvasConfig.colors.defaultRole;

	ctx.font = canvasConfig.fonts.name;
	ctx.textAlign = "left" as CanvasTextAlign;
	ctx.textBaseline = "top";
	ctx.fillStyle = roleColor;

	const startY = canvasConfig.text.initialY;

	ctx.fillText(displayName, canvasConfig.text.leftX, startY);

	const nameWidth = ctx.measureText(displayName).width;

	const timeText = formatTime(interaction.createdAt ?? new Date());

	ctx.font = canvasConfig.fonts.time;
	ctx.fillStyle = canvasConfig.colors.time;

	ctx.fillText(
		timeText,
		canvasConfig.text.leftX + nameWidth + canvasConfig.padding.time,
		startY + 2,
	);
}

function drawMessageText(ctx: SKRSContext2D, lines: string[]) {
	ctx.font = canvasConfig.fonts.message;
	ctx.fillStyle = canvasConfig.colors.text;
	ctx.textBaseline = "top";

	let y = canvasConfig.text.initialY + canvasConfig.text.topOffset;

	for (const line of lines) {
		ctx.fillText(line, canvasConfig.text.leftX, y);
		y += canvasConfig.text.lineHeight;
	}
}

function formatTime(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export async function run(
	_client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const text = interaction.options.getString("message", true);
	const user = interaction.options.getUser("user", true);

	await interaction.deferReply();

	const { width, height, lines } = calculateDimensions(text);

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	drawBackground(ctx, width, height);
	await drawAvatar(ctx, user);
	await drawUserInfo(ctx, user, interaction);
	drawMessageText(ctx, lines);

	const buffer = canvas.toBuffer("image/png");

	const attachment = new AttachmentBuilder(buffer, {
		name: "discord-message.png",
	});

	await interaction.editReply({ files: [attachment] });
}

export const data = new SlashCommandBuilder()
	.setName("fake")
	.setDescription("Generate fake Discord message")
	.addStringOption((option) =>
		option.setName("message").setDescription("Message text").setRequired(true),
	)
	.addUserOption((option) =>
		option.setName("user").setDescription("User").setRequired(true),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
