import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

interface BingImage {
	startdate: string;
	fullstartdate: string;
	enddate: string;
	url: string;
	urlbase: string;
	title: string;
	copyright: string;
}

interface BingResponse {
	images: BingImage[];
}
const usedImages = new Set<string>();

export async function run(
	_client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const response = await fetch(
		"https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=50",
	);

	const resdata = (await response.json()) as BingResponse;
	const images = resdata.images;

	if (!images || images.length === 0) {
		return interaction.editReply("No images found.");
	}
	const randomImage = getRandomUnused(images);
	if (!randomImage) {
		return interaction.editReply("No images available.");
	}

	const startTs = parseBingDate(randomImage.startdate);
	const fullTs = parseBingDate(
		randomImage.startdate,
		randomImage.fullstartdate,
	);
	const startFormatted = `<t:${startTs}:F>`;
	const fullFormatted = `<t:${fullTs}:F>`;
	const imageUrl = `https://www.bing.com${randomImage.url}`;

	await interaction.reply({
		embeds: [
			{
				title: randomImage.copyright || "Bing Image",
				description: `Start date: ${startFormatted}\nFull start: ${fullFormatted}`,
				image: { url: imageUrl },
			},
		],
	});
	console.log("RandomImage: ", randomImage);
}
function parseBingDate(start: string, full?: string): number {
	if (full) {
		const year = Number(full.slice(0, 4));
		const month = Number(full.slice(4, 6)) - 1;
		const day = Number(full.slice(6, 8));
		const hour = Number(full.slice(8, 10));
		const minute = Number(full.slice(10, 12));

		return Math.floor(
			new Date(year, month, day, hour, minute).getTime() / 1000,
		);
	}

	const year = Number(start.slice(0, 4));
	const month = Number(start.slice(4, 6)) - 1;
	const day = Number(start.slice(6, 8));

	return Math.floor(new Date(year, month, day).getTime() / 1000);
}
function getRandomUnused(images: BingImage[]): BingImage | null {
	const unused = images.filter((img) => !usedImages.has(img.url));

	if (unused.length === 0) {
		usedImages.clear();
		return getRandomUnused(images);
	}

	const chosen = unused[Math.floor(Math.random() * unused.length)];
	usedImages.add(chosen.url);

	return chosen;
}
export const data = new SlashCommandBuilder()
	.setName("randombing")
	.setDescription("Get random image from bing image gallery.")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
