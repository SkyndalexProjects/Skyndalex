import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	MediaGalleryBuilder,
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

interface NasaAssetLink {
	href: string;
	rel: string;
	render?: "image" | "video";
	width?: number;
	height?: number;
	size?: number;
}

interface NasaAssetData {
	center?: string;
	date_created: string;
	description?: string;
	keywords?: string[];
	location?: string;
	media_type: "image" | "video" | "audio";
	nasa_id: string;
	photographer?: string;
	title: string;
}

interface NasaAssetItem {
	href: string;
	data: NasaAssetData[];
	links: NasaAssetLink[];
}

interface NasaAssetResponse {
	collection: {
		version: string;
		href: string;
		items: NasaAssetItem[];
	};
}

export async function run(
	_client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.deferReply();
	const amount = interaction.options.getInteger("images-count") || 5;
	const response = await fetch("https://images-assets.nasa.gov/recent.json");
	const data = (await response.json()) as NasaAssetResponse;

	const images = data.collection.items
		.filter((item) => item.data?.[0]?.media_type === "image")
		.sort((a, b) => {
			const aDate = Date.parse(a.data?.[0]?.date_created ?? "");
			const bDate = Date.parse(b.data?.[0]?.date_created ?? "");

			return aDate - bDate;
		})
		.slice(0, amount);

	const gallery = new MediaGalleryBuilder().addItems(
		...images.map((item) => {
			const imageLink =
				item.links.find(
					(link) => link.render === "image" && link.href.includes("~large"),
				) ?? item.links.find((link) => link.render === "image");
			return {
				media: {
					url: imageLink?.href ?? item.href,
				},
				description:
					`${item.data[0].title}\n` +
					`📅 ${new Date(item.data[0].date_created).toLocaleDateString(
						"pl-PL",
					)}`,
			};
		}),
	);

	const container = new ContainerBuilder()
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`# 🚀 The newest NASA photos`),
		)
		.addMediaGalleryComponents(gallery);

	await interaction.editReply({
		components: [container],
		flags: MessageFlags.IsComponentsV2,
	});
}
export const data = new SlashCommandBuilder()
	.setName("nasa")
	.setDescription("Get the latest images from nasa gallery.")
	.addIntegerOption((option) =>
		option
			.setName("images-count")
			.setDescription("Number of images to display in image gallery")
			.setMaxValue(10),
	)
	.addStringOption((option) =>
		option.setName("images_category").setDescription("Select category"),
	)
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
