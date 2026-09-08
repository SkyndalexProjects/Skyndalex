import {
	type CanvasTextAlign,
	createCanvas,
	loadImage,
	type SKRSContext2D,
} from "@napi-rs/canvas";
import type { User } from "discord.js";
import { getLines } from "#utils";
import { CanvasRenderer } from "./CanvasRenderer.js";

const config = {
	width: 1200,
	height: 675,

	avatar: {
		width: 550,
		height: 675,
		blurStartX: 220,
		fadeStartX: 330,
		fadeEndX: 470,
	},

	text: {
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
		font: `normal 32px Poppins, sans-serif`,
		gap: 3,
		height: 20,
	},

	colors: {
		background: "#000000",
		text: "#ffffff",
		author: "#bdbdbd",
	},
} as const;

export interface QuoteImageOptions {
	message: string;
	author: string;
	user: User;
}

interface QuoteLayout {
	fontSize: number;
	lineHeight: number;
	lines: string[];
}

export class QuoteImageRenderer extends CanvasRenderer<QuoteImageOptions> {
	public async render(options: QuoteImageOptions): Promise<Buffer> {
		const canvas = createCanvas(config.width, config.height);
		const ctx = canvas.getContext("2d");

		this.drawBackground(ctx);
		await this.drawAvatar(ctx, options.user);
		this.drawQuote(ctx, options.message, options.author);

		return canvas.toBuffer("image/png");
	}

	private drawBackground(ctx: SKRSContext2D): void {
		ctx.fillStyle = config.colors.background;
		ctx.fillRect(0, 0, config.width, config.height);
	}

	private async drawAvatar(ctx: SKRSContext2D, user: User): Promise<void> {
		const avatar = await loadImage(
			user.displayAvatarURL({
				extension: "png",
				size: 1024,
			}),
		);

		const avatarCanvas = createCanvas(
			config.avatar.width,
			config.avatar.height,
		);

		const avatarCtx = avatarCanvas.getContext("2d");

		const scale = Math.max(
			config.avatar.width / avatar.width,
			config.avatar.height / avatar.height,
		);

		const width = avatar.width * scale;
		const height = avatar.height * scale;

		const x = (config.avatar.width - width) / 2;
		const y = (config.avatar.height - height) / 2;

		avatarCtx.drawImage(avatar, x, y, width, height);

		this.applyGreyscale(avatarCtx);
		this.applyFade(avatarCtx);

		ctx.drawImage(avatarCanvas, 0, 0);
	}

	private applyGreyscale(ctx: SKRSContext2D): void {
		const imageData = ctx.getImageData(
			0,
			0,
			config.avatar.width,
			config.avatar.height,
		);

		for (let index = 0; index < imageData.data.length; index += 4) {
			const red = imageData.data[index];
			const green = imageData.data[index + 1];
			const blue = imageData.data[index + 2];

			const grey = red * 0.299 + green * 0.587 + blue * 0.114;

			imageData.data[index] = grey;
			imageData.data[index + 1] = grey;
			imageData.data[index + 2] = grey;
		}

		ctx.putImageData(imageData, 0, 0);
	}

	private applyFade(ctx: SKRSContext2D): void {
		const mask = createCanvas(config.avatar.width, config.avatar.height);

		const maskCtx = mask.getContext("2d");

		const gradient = maskCtx.createLinearGradient(
			config.avatar.fadeStartX,
			0,
			config.avatar.fadeEndX,
			0,
		);

		gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
		gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
		gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

		maskCtx.fillStyle = "#ffffff";
		maskCtx.fillRect(0, 0, config.avatar.fadeStartX, config.avatar.height);

		maskCtx.fillStyle = gradient;
		maskCtx.fillRect(
			config.avatar.fadeStartX,
			0,
			config.avatar.fadeEndX - config.avatar.fadeStartX,
			config.avatar.height,
		);

		ctx.globalCompositeOperation = "destination-in";
		ctx.drawImage(mask, 0, 0);
		ctx.globalCompositeOperation = "source-over";
	}

	private drawQuote(ctx: SKRSContext2D, message: string, author: string): void {
		const layout = this.getLayout(ctx, message);

		const totalTextHeight = layout.lines.length * layout.lineHeight;

		const totalHeight =
			totalTextHeight + config.author.gap + config.author.height;

		let y = config.text.centerY - totalHeight / 2;

		y = Math.max(40, Math.min(y, config.height - totalHeight - 40));

		ctx.font = `${layout.fontSize}px ${config.text.fontFamily}`;
		ctx.fillStyle = config.colors.text;
		ctx.textAlign = "center" as CanvasTextAlign;
		ctx.textBaseline = "top";

		for (const line of layout.lines) {
			ctx.fillText(line, config.text.centerX, y);
			y += layout.lineHeight;
		}

		this.drawAuthor(ctx, author, y + config.author.gap);
	}

	private getLayout(ctx: SKRSContext2D, message: string): QuoteLayout {
		for (
			let fontSize = config.text.maxFontSize;
			fontSize >= config.text.minFontSize;
			fontSize -= 2
		) {
			const lineHeight = Math.round(
				fontSize * config.text.lineHeightMultiplier,
			);

			ctx.font = `${fontSize}px ${config.text.fontFamily}`;

			const lines = getLines(ctx, message, config.text.maxWidth);

			if (lines.length * lineHeight <= config.text.maxHeight) {
				return {
					fontSize,
					lineHeight,
					lines,
				};
			}
		}

		const fontSize = config.text.minFontSize;
		const lineHeight = Math.round(fontSize * config.text.lineHeightMultiplier);

		ctx.font = `${fontSize}px ${config.text.fontFamily}`;

		const lines = getLines(ctx, message, config.text.maxWidth);

		const maxLines = Math.max(
			1,
			Math.floor(config.text.maxHeight / lineHeight),
		);

		const visibleLines = lines.slice(0, maxLines);

		if (lines.length > maxLines) {
			let lastLine = visibleLines.at(-1) ?? "";

			while (
				lastLine.length > 0 &&
				ctx.measureText(`${lastLine}...`).width > config.text.maxWidth
			) {
				lastLine = lastLine.slice(0, -1).trimEnd();
			}

			visibleLines[visibleLines.length - 1] = `${lastLine}...`;
		}

		return {
			fontSize,
			lineHeight,
			lines: visibleLines,
		};
	}

	private drawAuthor(ctx: SKRSContext2D, author: string, y: number): void {
		ctx.font = config.author.font;
		ctx.fillStyle = config.colors.author;
		ctx.textAlign = "center" as CanvasTextAlign;
		ctx.textBaseline = "top";

		let text = `— ${author}`;

		while (
			text.length > 0 &&
			ctx.measureText(`${text}...`).width > config.text.maxWidth
		) {
			text = text.slice(0, -1).trimEnd();
		}

		ctx.fillText(
			text.length < author.length + 2 ? `${text}...` : text,
			config.text.centerX,
			y,
		);
	}
}
