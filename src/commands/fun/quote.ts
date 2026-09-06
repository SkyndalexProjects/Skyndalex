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
	width: 1200,
	height: 675,

	avatar: {
		x: 0,
		y: 0,
		width: 550,
		height: 675,
		blurStartX: 220,
		fadeStartX: 330,
		fadeEndX: 470,
	},

	text: {
		x: 730,
		centerX: 820,
		centerY: 300,
		maxWidth: 600,
		maxHeight: 600,
		maxFontSize: 80,
		minFontSize: 15,
		lineHeightMultiplier: 1.4,
		fontFamily: `"RougeScript", "Segoe Script", cursive`,
	},

	author: {
		x: 700,
		y: 400,
		font: `normal 32px poppins, Poppins, sans-serif`,
		gap: 3,
		height: 20,
	},

	colors: {
		background: "#000000",
		text: "#ffffff",
		author: "#bdbdbd",
	},
};

type QuoteLayout = {
	fontSize: number;
	lineHeight: number;
	lines: string[];
};

class QuoteImageRenderer {
	public async render(options: {
		message: string;
		author: string;
		user: User;
	}): Promise<Buffer> {
		const canvas = createCanvas(canvasConfig.width, canvasConfig.height);
		const ctx = canvas.getContext("2d");

		this.drawBackground(ctx);
		await this.drawGreyscaleAvatar(ctx, options.user);
		this.drawQuoteAndAuthor(ctx, options.message, options.author);

		return canvas.toBuffer("image/png");
	}

	private get quoteFontFamily() {
		return canvasConfig.text.fontFamily;
	}

	private getQuoteFont(fontSize: number) {
		return `${fontSize}px ${this.quoteFontFamily}`;
	}

	private drawBackground(ctx: SKRSContext2D) {
		ctx.fillStyle = canvasConfig.colors.background;
		ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height);
	}

	private async drawGreyscaleAvatar(ctx: SKRSContext2D, user: User) {
		const avatarURL = user.displayAvatarURL({ extension: "png", size: 1024 });
		const avatar = await loadImage(avatarURL);

		const avatarCanvas = createCanvas(
			canvasConfig.avatar.width,
			canvasConfig.avatar.height,
		);
		const avatarCtx = avatarCanvas.getContext("2d");

		const scale = Math.max(
			canvasConfig.avatar.width / avatar.width,
			canvasConfig.avatar.height / avatar.height,
		);
		const scaledWidth = avatar.width * scale;
		const scaledHeight = avatar.height * scale;
		const dx = (canvasConfig.avatar.width - scaledWidth) / 2;
		const dy = (canvasConfig.avatar.height - scaledHeight) / 2;

		avatarCtx.filter = "none";
		avatarCtx.drawImage(avatar, dx, dy, scaledWidth, scaledHeight);

		const blurCanvas = createCanvas(
			canvasConfig.avatar.width,
			canvasConfig.avatar.height,
		);
		const blurCtx = blurCanvas.getContext("2d");

		blurCtx.drawImage(avatar, dx, dy, scaledWidth, scaledHeight);
		blurCtx.filter = "none";

		const maskCanvas = createCanvas(
			canvasConfig.avatar.width,
			canvasConfig.avatar.height,
		);
		const maskCtx = maskCanvas.getContext("2d");

		const blurMask = maskCtx.createLinearGradient(
			canvasConfig.avatar.blurStartX,
			0,
			canvasConfig.avatar.fadeEndX,
			0,
		);
		blurMask.addColorStop(0, "rgba(255, 255, 255, 0)");
		blurMask.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
		blurMask.addColorStop(1, "rgba(255, 255, 255, 1)");

		maskCtx.fillStyle = blurMask;
		maskCtx.fillRect(
			0,
			0,
			canvasConfig.avatar.width,
			canvasConfig.avatar.height,
		);

		blurCtx.globalCompositeOperation = "destination-in";
		blurCtx.drawImage(maskCanvas, 0, 0);
		blurCtx.globalCompositeOperation = "source-over";

		avatarCtx.drawImage(blurCanvas, 0, 0);

		this.applyGreyscale(avatarCtx);
		this.applyAvatarFade(avatarCtx);

		ctx.drawImage(
			avatarCanvas,
			canvasConfig.avatar.x,
			canvasConfig.avatar.y,
			canvasConfig.avatar.width,
			canvasConfig.avatar.height,
		);
	}

	private applyGreyscale(ctx: SKRSContext2D) {
		const imageData = ctx.getImageData(
			0,
			0,
			canvasConfig.avatar.width,
			canvasConfig.avatar.height,
		);
		const pixels = imageData.data;

		for (let i = 0; i < pixels.length; i += 4) {
			const grey =
				pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;

			pixels[i] = grey;
			pixels[i + 1] = grey;
			pixels[i + 2] = grey;
		}

		ctx.putImageData(imageData, 0, 0);
	}

	private applyAvatarFade(ctx: SKRSContext2D) {
		const avatarFadeMask = createCanvas(
			canvasConfig.avatar.width,
			canvasConfig.avatar.height,
		);
		const avatarFadeMaskCtx = avatarFadeMask.getContext("2d");

		const avatarAlphaFade = avatarFadeMaskCtx.createLinearGradient(
			canvasConfig.avatar.fadeStartX,
			0,
			canvasConfig.avatar.fadeEndX,
			0,
		);

		avatarAlphaFade.addColorStop(0, "rgba(255, 255, 255, 1)");
		avatarAlphaFade.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
		avatarAlphaFade.addColorStop(1, "rgba(255, 255, 255, 0)");

		avatarFadeMaskCtx.fillStyle = "#ffffff";
		avatarFadeMaskCtx.fillRect(
			0,
			0,
			canvasConfig.avatar.fadeStartX,
			canvasConfig.avatar.height,
		);

		avatarFadeMaskCtx.fillStyle = avatarAlphaFade;
		avatarFadeMaskCtx.fillRect(
			canvasConfig.avatar.fadeStartX,
			0,
			canvasConfig.avatar.fadeEndX - canvasConfig.avatar.fadeStartX,
			canvasConfig.avatar.height,
		);

		ctx.globalCompositeOperation = "destination-in";
		ctx.drawImage(avatarFadeMask, 0, 0);
		ctx.globalCompositeOperation = "source-over";
	}

	private getQuoteLayout(ctx: SKRSContext2D, text: string): QuoteLayout {
		for (
			let fontSize = canvasConfig.text.maxFontSize;
			fontSize >= canvasConfig.text.minFontSize;
			fontSize -= 2
		) {
			const lineHeight = Math.round(
				fontSize * canvasConfig.text.lineHeightMultiplier,
			);

			ctx.font = this.getQuoteFont(fontSize);

			const lines = getLines(ctx, text, canvasConfig.text.maxWidth);
			const totalHeight = lines.length * lineHeight;

			if (totalHeight <= canvasConfig.text.maxHeight) {
				return { fontSize, lineHeight, lines };
			}
		}

		return this.getFallbackQuoteLayout(ctx, text);
	}

	private getFallbackQuoteLayout(
		ctx: SKRSContext2D,
		text: string,
	): QuoteLayout {
		const fontSize = canvasConfig.text.minFontSize;
		const lineHeight = Math.round(
			fontSize * canvasConfig.text.lineHeightMultiplier,
		);

		ctx.font = this.getQuoteFont(fontSize);

		const lines = getLines(ctx, text, canvasConfig.text.maxWidth);
		const maxLines = Math.max(
			1,
			Math.floor(canvasConfig.text.maxHeight / lineHeight),
		);
		const visibleLines = lines.slice(0, maxLines);

		if (lines.length > maxLines) {
			const lastLine = visibleLines[visibleLines.length - 1] ?? "";
			let trimmedLine = lastLine;

			while (
				trimmedLine.length > 0 &&
				ctx.measureText(`${trimmedLine}...`).width > canvasConfig.text.maxWidth
			) {
				trimmedLine = trimmedLine.slice(0, -1).trimEnd();
			}

			visibleLines[visibleLines.length - 1] = `${trimmedLine}...`;
		}

		return { fontSize, lineHeight, lines: visibleLines };
	}

	private drawQuoteAndAuthor(ctx: SKRSContext2D, text: string, author: string) {
		const { fontSize, lineHeight, lines } = this.getQuoteLayout(ctx, text);
		const totalTextHeight = lines.length * lineHeight;
		const totalBlockHeight =
			totalTextHeight + canvasConfig.author.gap + canvasConfig.author.height;

		let y = canvasConfig.text.centerY - totalBlockHeight / 2;

		y = Math.max(40, Math.min(y, canvasConfig.height - totalBlockHeight - 40));

		ctx.font = this.getQuoteFont(fontSize);
		ctx.fillStyle = canvasConfig.colors.text;
		ctx.textAlign = "center" as CanvasTextAlign;
		ctx.textBaseline = "top";

		for (const line of lines) {
			ctx.fillText(line, canvasConfig.text.centerX, y);
			y += lineHeight;
		}

		this.drawAuthor(ctx, author, y + canvasConfig.author.gap);
	}

	private drawAuthor(ctx: SKRSContext2D, author: string, y: number) {
		ctx.font = canvasConfig.author.font;
		ctx.fillStyle = canvasConfig.colors.author;
		ctx.textAlign = "center" as CanvasTextAlign;
		ctx.textBaseline = "top";

		const authorText = `— ${author}`;
		const maxWidth = canvasConfig.text.maxWidth;

		if (ctx.measureText(authorText).width <= maxWidth) {
			ctx.fillText(authorText, canvasConfig.text.centerX, y);
			return;
		}

		let trimmedAuthor = authorText;

		while (
			trimmedAuthor.length > 0 &&
			ctx.measureText(`${trimmedAuthor}...`).width > maxWidth
		) {
			trimmedAuthor = trimmedAuthor.slice(0, -1).trimEnd();
		}

		ctx.fillText(`${trimmedAuthor}...`, canvasConfig.text.centerX, y);
	}
}

export async function run(
	_client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const message = interaction.options.getString("message", true);
	const user = interaction.options.getUser("user") ?? interaction.user;
	const authorOverride = interaction.options.getString("author");
	const author =
		authorOverride ??
		interaction.guild?.members.cache.get(user.id)?.displayName ??
		user.displayName ??
		user.username;

	await interaction.deferReply();

	const renderer = new QuoteImageRenderer();
	const imageBuffer = await renderer.render({
		message,
		author,
		user,
	});

	const attachment = new AttachmentBuilder(imageBuffer, {
		name: "quote.png",
	});

	await interaction.editReply({ files: [attachment] });
}

export const data = new SlashCommandBuilder()
	.setName("quote")
	.setDescription("Sends a quote")
	.addStringOption((option) =>
		option
			.setName("message")
			.setDescription("The quote text")
			.setRequired(true),
	)
	.addUserOption((option) =>
		option
			.setName("user")
			.setDescription(
				"Attribute the quote to this member (uses their avatar + name)",
			)
			.setRequired(false),
	)
	.addStringOption((option) =>
		option
			.setName("author")
			.setDescription("Override the name shown under the quote")
			.setRequired(false),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
