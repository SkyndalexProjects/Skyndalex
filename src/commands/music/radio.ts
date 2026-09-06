import { RadioProvider } from "@prisma/client";
import {
	ActionRowBuilder,
	type AutocompleteInteraction,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	TextDisplayBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import type {
	RadioBrowserStationQueryResult,
	radioStationSearchQueryResult,
} from "#types";

interface RadioGardenChannelData {
	title?: string;
	country?: { title?: string };
	place?: { title?: string };
	website?: string;
}

// interface FavoriteRadio {
// 	id: number;
// 	userId: string;
// 	provider: string;
// 	stationName: string;
// 	stationSource: string;
// 	resourceUrl: string;
// 	createdAt: Date;
// 	updatedAt: Date;
// }

function extractRadioGardenChannelId(station: string): string | undefined {
	const lastSegment = station.match(/\/([^/?#]+)(?:[?#].*)?$/);
	if (lastSegment?.[1]) return lastSegment[1];

	const rgMatch = station.match(/\/listen\/[^/]+\/([^/?#]+)/);
	if (rgMatch?.[1]) return rgMatch[1];

	return station || undefined;
}

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	try {
		await interaction.deferReply();

		const source1 = interaction.options.getString("source1");
		const source2 = interaction.options.getString("source2");

		const station = source1 ?? source2;
		const provider = source1
			? RadioProvider.RADIO_GARDEN
			: RadioProvider.RADIO_BROWSER;

		if (!station) {
			return await interaction.editReply({
				content: "Please provide a radio station source.",
			});
		}

		const memberChannel = interaction.member.voice.channel;
		if (!memberChannel) {
			return await interaction.editReply({
				content: "Please join a voice channel first.",
			});
		}

		const currentRadioAction = await client.radio.startRadio(
			client,
			station,
			interaction.guild.id,
			memberChannel.id,
			interaction.user.id,
			provider,
			interaction,
		);

		if (currentRadioAction?.action === "error") {
			return await interaction.editReply({
				content: "❌ Radio station not found or could not be played.",
			});
		}

		let stationTitle = station;
		let countryTitle = "Unknown Country";
		let placeTitle = "";
		let website = "";
		let streamUrl = "";

		if (provider === RadioProvider.RADIO_GARDEN) {
			const channelId = extractRadioGardenChannelId(station);

			if (!channelId) {
				return await interaction.editReply({
					content: "No station channel ID",
				});
			}

			const url = `https://radio.garden/api/ara/content/channel/${channelId}/`;

			let getRadioDetails = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "application/json",
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
				},
			});

			let radioDetailsJson = await safeParseJson<{
				data?: RadioGardenChannelData;
			}>(getRadioDetails, {});

			if (!radioDetailsJson || Object.keys(radioDetailsJson).length === 0) {
				const altUrl = `https://radio.garden/api/ara/content/channel/${channelId}`;
				getRadioDetails = await fetch(altUrl, {
					method: "GET",
					headers: {
						Accept: "application/json",
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
					},
				});
				radioDetailsJson = await safeParseJson(getRadioDetails, {});
			}

			if (!radioDetailsJson || Object.keys(radioDetailsJson).length === 0) {
				console.error(
					"Failed to fetch radio station details even after fallback",
				);
				return await interaction.editReply({
					content: `❌ No station data.\n\nDebug Info:\n- Station: ${station}\n- Channel ID: ${channelId}\n\nAPI radio.garden might be unavailable.`,
				});
			}

			const stationData = radioDetailsJson.data ?? {};
			stationTitle = stationData.title || stationTitle;
			countryTitle = stationData.country?.title || countryTitle;
			placeTitle = stationData.place?.title || placeTitle;
			website = stationData.website || website;

			streamUrl = `https://radio.garden/api/ara/content/listen/${channelId}/channel.mp3`;
		} else {
			const url = `https://de1.api.radio-browser.info/json/stations/byuuid/${station}`;

			const response = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "application/json",
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
				},
			});

			const stations = (await safeParseJson(
				response,
				[],
			)) as RadioBrowserStationQueryResult[];
			const stationData = stations[0];

			if (!stationData) {
				return await interaction.editReply({
					content: "❌ No stations data from RadioBrowser",
				});
			}

			stationTitle = stationData.name || stationTitle;
			countryTitle = stationData.country || countryTitle;
			placeTitle = stationData.state || stationData.country || placeTitle;
			website = stationData.homepage || website;

			streamUrl = stationData.url_resolved || stationData.url || "";
		}

		const existingState = client.radioStateManager.getInstance(
			interaction.guild.id,
		);
		if (existingState) {
			client.radioStateManager.setInstance(interaction.guild.id, {
				...existingState,
				radioStation: stationTitle,
				stationSource: station,
				provider,
			});
		}

		let nowPlayingSong: string | undefined;

		if (streamUrl) {
			try {
				const icyResult =
					await client.radio.fetchCurrentlyPlayingSong(streamUrl);
				if (icyResult.streamTitle) {
					nowPlayingSong = icyResult.streamTitle;
				}
			} catch (icyError) {
				console.error("Error fetching ICY metadata:", icyError);
			}
		}

		const descLines: string[] = [];

		descLines.push("### Additional info");
		descLines.push(`🌍 | Country: \`${countryTitle}\``);
		if (placeTitle) {
			descLines.push(`🏙️ | City: **${placeTitle}**`);
		}
		if (website) {
			descLines.push(`🌐 | Website: [Here](${website})`);
		}

		const nowPlayingLabel =
			currentRadioAction?.action === "switched"
				? "Switched to"
				: "Currently playing";
		const nowPlayingText =
			nowPlayingSong ||
			"Oops, no ICY metadata found (or maybe no song is being played)";

		const title = new TextDisplayBuilder().setContent(
			`## ${stationTitle}\n > 🎵  ${nowPlayingLabel}: \`${nowPlayingText}\` on vc: <#${memberChannel.id}>`,
		);
		const desc = new TextDisplayBuilder().setContent(
			`${descLines.join("\n")}\n`,
		);
		const footer = new TextDisplayBuilder().setContent(
			"-# 🔗 | Tip: You can manage the radio playback via Dashboard\n-# ❤️ | Enjoying the bot? Consider supporting us if you like the bot.",
		);

		const getFavorites = await client.prisma.radioFavorites.findUnique({
			where: {
				userId_provider_stationSource: {
					userId: interaction.user.id,
					provider,
					stationSource: station,
				},
			},
		});

		const isFavorite = !!getFavorites;

		const addFavoriteButton = new ButtonBuilder()
			.setCustomId("manage-favorite")
			.setLabel(isFavorite ? "Delete from favorites" : "Add to favorites")
			.setStyle(isFavorite ? ButtonStyle.Danger : ButtonStyle.Primary);

		const playButton = new ButtonBuilder()
			.setCustomId("radio-play")
			.setLabel("Play")
			.setStyle(ButtonStyle.Success);

		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			playButton,
			addFavoriteButton,
		);

		const separator = new SeparatorBuilder().setSpacing(
			SeparatorSpacingSize.Large,
		);

		const container = new ContainerBuilder()
			.addTextDisplayComponents(title)
			.addSeparatorComponents(separator)
			.addTextDisplayComponents(desc)
			.addSeparatorComponents(separator)
			.addActionRowComponents(actionRow)
			.addSeparatorComponents(separator)
			.addTextDisplayComponents(footer)
			.setAccentColor(0x4caf7a);

		await interaction.editReply({
			flags: MessageFlags.IsComponentsV2,
			components: [container],
		});
	} catch (e) {
		console.error(e);
	}
}

export const data = new SlashCommandBuilder()
	.setName("radio")
	.setDescription("Play a radio")
	.addStringOption((option) =>
		option
			.setName("source1")
			.setDescription(
				"Play radio from radio.garden. Search by name/place/country",
			)
			.setAutocomplete(true),
	)
	.addStringOption((option) =>
		option
			.setName("source2")
			.setDescription(
				"Play radio from radio-browser.info. Search by name/place/country",
			)
			.setAutocomplete(true),
	);

export async function autocomplete(interaction: AutocompleteInteraction) {
	const focused = interaction.options.getFocused(true);
	const focusedValue = focused.value;
	const focusedName = focused.name;
	const provider =
		focusedName === "source1"
			? RadioProvider.RADIO_GARDEN
			: RadioProvider.RADIO_BROWSER;

	if (!focusedValue) {
		const favorites = await interaction.client.prisma.radioFavorites.findMany({
			where: {
				provider,
				userId: interaction.user.id,
			},
		});

		const items = favorites.map((favorite) => ({
			name: favorite.stationName,
			value: favorite.stationSource,
		}));

		return await interaction.respond(items.slice(0, 25));
	}

	const data: { name: string; value: string }[] = [];

	if (focusedName === "source1") {
		try {
			const url = `https://radio.garden/api/search?q=${encodeURIComponent(focusedValue)}`;
			const response = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "application/json",
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
				},
			});

			const jsonResponse = await safeParseJson<radioStationSearchQueryResult>(
				response,
				{} as radioStationSearchQueryResult,
			);

			for (const radioStation of jsonResponse?.hits?.hits ?? []) {
				if (radioStation._source.type !== "channel") continue;

				const source = radioStation._source as {
					code: string;
					subtitle: string;
					type: string;
					title: string;
					secure: boolean;
					url: string;
					page: { title: string; url: string };
				};

				data.push({
					name: source.page.title,
					value: source.page.url,
				});
			}
		} catch (error) {
			console.error("Error fetching radio.garden autocomplete:", error);
		}

		return await interaction.respond(data.slice(0, 25));
	}

	if (focusedName === "source2") {
		try {
			const url = `https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(focusedValue)}?limit=25`;
			const response = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "application/json",
				},
			});

			const jsonResponse = (await safeParseJson(
				response,
				[],
			)) as RadioBrowserStationQueryResult[];
			for (const station of jsonResponse) {
				if (!station.url_resolved) continue;

				data.push({
					name: `${station.name} (${station.country})`.slice(0, 100),
					value: station.stationuuid,
				});
			}
		} catch (error) {
			console.error("Error fetching radio-browser.info autocomplete:", error);
		}

		return await interaction.respond(data.slice(0, 25));
	}
}

async function safeParseJson<T>(res: Response, fallback: T): Promise<T> {
	try {
		if (!res.ok) {
			console.warn(`Non-ok response: ${res.status} ${res.statusText}`);
			return fallback;
		}
		if (res.status === 204) {
			return fallback;
		}

		const raw = await res.text();
		if (!raw.trim()) {
			console.warn("Empty response body");
			return fallback;
		}

		return JSON.parse(raw) as T;
	} catch (error) {
		console.error("Error parsing JSON:", error);
		return fallback;
	}
}
