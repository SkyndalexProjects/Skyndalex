import {
	AttachmentBuilder,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import {
	CanvasTextAlign,
	createCanvas,
	loadImage,
	SKRSContext2D,
} from "@napi-rs/canvas";
import { User } from "discord.js";
import { getLines } from "#utils";

const canvasConfig = {
	width: 1200,
	baseHeight: 165,
	avatar: {
		x: 30,
		y: 30,
		size: 95,
	},
	text: {
		initialY: 30,
		topOffset: 50,
		lineHeight: 40,
		leftX: 150,
		rightPadding: 150,
	},
	fonts: {
		name: "32px ggsans",
		time: "20px ggsans",
		message: "26px ggsans",
	},
	colors: {
		background: "#1A1A1E",
		text: "#9aa0a6",
		defaultRole: "#ffffff",
	},
	padding: {
		bottom: 20,
		time: 10,
	},
};

async function drawAvatar(ctx: SKRSContext2D, user: User): Promise<void> {
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
function calculateCanvasDimensions(text: string) {
	const tempCanvas = createCanvas(canvasConfig.width, canvasConfig.baseHeight);
	const tempCtx = tempCanvas.getContext("2d");
	tempCtx.font = canvasConfig.fonts.message;

	const maxTextWidth =
		canvasConfig.width -
		canvasConfig.text.leftX -
		canvasConfig.text.rightPadding;

	const lines = getLines(tempCtx, text, maxTextWidth);
	const textStartY = canvasConfig.text.initialY + canvasConfig.text.topOffset;
	const textHeight =
		textStartY +
		lines.length * canvasConfig.text.lineHeight +
		canvasConfig.padding.bottom;

	const canvasHeight = Math.max(
		canvasConfig.baseHeight,
		canvasConfig.avatar.y +
			canvasConfig.avatar.size +
			canvasConfig.padding.bottom,
		textHeight,
	);

	return { lines, canvasHeight };
}
function drawBackground(ctx: SKRSContext2D, height: number) {
	ctx.fillStyle = canvasConfig.colors.background;
	ctx.fillRect(0, 0, canvasConfig.width, height);
}
async function drawUserInfo(
	ctx: SKRSContext2D,
	user: User,
	interaction: ChatInputCommandInteraction,
) {
	const member = interaction.guild?.members.cache.get(user.id);
	const displayName = (member?.displayName ?? user.username).replace(/,/g, "");
	const roleColor = member?.displayHexColor ?? canvasConfig.colors.defaultRole;

	ctx.font = canvasConfig.fonts.name;
	ctx.textAlign = "left" as CanvasTextAlign;
	ctx.textBaseline = "top";
	ctx.fillStyle = roleColor;
	ctx.strokeStyle = "transparent";
	ctx.lineWidth = 2;

	const startY = canvasConfig.text.initialY;
	ctx.strokeText(displayName, canvasConfig.text.leftX, startY);
	ctx.fillText(displayName, canvasConfig.text.leftX, startY);

	const nameWidth = ctx.measureText(displayName).width;
	const timeText = formatTime(interaction.createdAt ?? new Date());

	ctx.font = canvasConfig.fonts.time;
	ctx.fillStyle = canvasConfig.colors.text;
	ctx.fillText(
		timeText,
		canvasConfig.text.leftX + nameWidth + canvasConfig.padding.time,
		startY + 10,
	);
}
function drawMessageText(ctx: SKRSContext2D, lines: string[]) {
	ctx.font = canvasConfig.fonts.message;
	ctx.fillStyle = canvasConfig.colors.text;
	ctx.textBaseline = "top";

	let lineY = canvasConfig.text.initialY + canvasConfig.text.topOffset;

	for (const line of lines) {
		ctx.fillText(line, canvasConfig.text.leftX, lineY);
		lineY += canvasConfig.text.lineHeight;
	}
}

function formatTime(date: Date): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const text = interaction.options.getString("message", true);
	const user = interaction.options.getUser("user", true);

	await interaction.deferReply();

	const { lines, canvasHeight } = calculateCanvasDimensions(text);
	const canvas = createCanvas(canvasConfig.width, canvasHeight);
	const ctx = canvas.getContext("2d");

	await drawAvatar(ctx, user);
	drawBackground(ctx, canvasHeight);
	await drawAvatar(ctx, user);
	await drawUserInfo(ctx, user, interaction);
	drawMessageText(ctx, lines);

	const buffer = canvas.toBuffer("image/png");
	const attachment = new AttachmentBuilder(buffer, { name: "screen.png" });
	await interaction.editReply({ files: [attachment] });
}

export const data = new SlashCommandBuilder()
	.setName("fake")
	.setDescription("Generate fake user message")
	.addStringOption((option) =>
		option
			.setName("message")
			.setDescription("Message text to display")
			.setRequired(true),
	)
	.addUserOption((option) =>
		option
			.setName("user")
			.setDescription("User to fake the message for")
			.setRequired(true),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
