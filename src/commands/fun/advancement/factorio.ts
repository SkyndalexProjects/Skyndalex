import {
	SlashCommandSubcommandBuilder,
	type ChatInputCommandInteraction,
} from "discord.js";
import { GlobalFonts, createCanvas, loadImage } from "@napi-rs/canvas";
import { getLines } from "#utils";
import { SkyndalexClient } from "#classes";
const canvas = createCanvas(724, 219);

const ctx = canvas.getContext("2d");

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();
	const imagePath = new URL(
		"../../../../assets/images/FactorioAdvancement.jpg",
		import.meta.url,
	).pathname;
	GlobalFonts.registerFromPath(
		new URL(
			"../../../../assets/fonts/TitilliumWeb-SemiBold.ttf",
			import.meta.url,
		).pathname,
	);

	const img = await loadImage(imagePath);
	const icon = await loadImage(
		"https://wiki.factorio.com/images/Getting-on-track-achievement.png",
	);
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	ctx.drawImage(icon, 10, 10, 200, 200);

	// Title
	ctx.fillStyle = "#96ca88";
	ctx.font = "20px 'Titillium Web'";
	const title = interaction.options.getString("title");
	ctx.fillText(title, 230, 50);

	// Description
	const maxWidth = 400;
	const lineHeight = 22;
	const description = interaction.options.getString("description");
	const lines = getLines(ctx, description, maxWidth);
	let startY = 80;

	ctx.fillStyle = "white";
	for (const line of lines) {
		ctx.fillText(line, 230, startY);
		startY += lineHeight;
	}

	const image = await canvas.encode("png");

	await interaction.editReply({
		files: [Buffer.from(image)],
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("factorio")
	.setDescription("Creat an advancement for factorio");
