import { CanvasRenderer } from "./CanvasRenderer.js";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { join } from "node:path";
import { getLines } from "../../../utils/index.js";

export interface ChangeMyMindOptions {
	text: string;
}

export class ChangeMyMindRenderer extends CanvasRenderer<ChangeMyMindOptions> {
	public async render(options: ChangeMyMindOptions): Promise<Buffer> {
		const canvas = createCanvas(384, 385);
		const ctx = canvas.getContext("2d");

		const imagePath = join(
			process.cwd(),
			"assets",
			"imgs",
			"change_my_mind.jpg",
		);

		const image = await loadImage(imagePath);

		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

		ctx.font = "20px Poppins-SemiBold";
		ctx.fillStyle = "black";
		ctx.textAlign = "left";

		const lines = getLines(ctx, options.text, 225);

		let y = 240;

		for (const line of lines) {
			ctx.fillText(line, 110, y);
			y += 22;
		}

		return canvas.toBuffer("image/png");
	}
}
