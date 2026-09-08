import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type CanvasTextAlign, createCanvas, loadImage } from "@napi-rs/canvas";
import { readFile } from "node:fs/promises";
import { getLines } from "#utils";
import { CanvasRenderer } from "./CanvasRenderer.js";
const currentDirectory = fileURLToPath(new URL(".", import.meta.url));

const imagePath = join(
	currentDirectory,
	"..",
	"..",
	"..",
	"..",
	"assets",
	"imgs",
	"daily_mail.png",
);

export interface DailyMailOptions {
	text: string;
}

export class DailyMailRenderer extends CanvasRenderer<DailyMailOptions> {
	public async render(options: DailyMailOptions): Promise<Buffer> {
		const image = await loadImage(await readFile(imagePath));

		const canvas = createCanvas(image.width, image.height);
		const ctx = canvas.getContext("2d");

		ctx.drawImage(image, 0, 0);

		ctx.font = "24px MyriadPro";
		ctx.textAlign = "left" as CanvasTextAlign;
		ctx.textBaseline = "top";
		ctx.fillStyle = "#000000";
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 2;

		const lines = getLines(ctx, options.text.replaceAll(",", ""), 370);

		let y = 80;

		for (const line of lines) {
			ctx.strokeText(line, 10, y);
			ctx.fillText(line, 10, y);
			y += 28;
		}

		return canvas.toBuffer("image/png");
	}
}
