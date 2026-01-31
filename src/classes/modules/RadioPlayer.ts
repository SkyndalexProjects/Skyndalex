import type { TrackResult } from "shoukaku";
import type { SkyndalexClient } from "#classes";
import { handleError } from "#utils";
import type { ChatInputCommandInteraction } from "discord.js";

export class RadioPlayer {
	constructor(private readonly client: SkyndalexClient) {
		this.client = client;
	}
	async startRadio(
		client: SkyndalexClient,
		station: string,
		guildId: string,
		channelId: string,
		requesterId: string,
		provider: string,
		interaction?: ChatInputCommandInteraction,
	) {
		try {
			let resourceUrl: string;
			let id: string;

			if (provider === "radio.garden") {
				id = (() => {
					const lastSegment = station.match(/\/([^\/?#]+)(?:[?#].*)?$/);
					if (lastSegment && lastSegment[1]) return lastSegment[1];

					const rgMatch = station.match(/\/listen\/[^\/]+\/([^\/?#]+)/);
					if (rgMatch && rgMatch[1]) return rgMatch[1];

					return station;
				})();
				resourceUrl = `https://radio.garden/api/ara/content/listen/${id}/channel.mp3`;
			} else {
				const response = await fetch(
					`https://de1.api.radio-browser.info/json/stations/byuuid/${station}`,
				);
				const stations = (await response.json()) as Array<{
					url_resolved?: string;
				}>;

				if (!stations || stations.length === 0 || !stations[0].url_resolved) {
					return { id: station, action: "error" };
				}

				id = station;
				resourceUrl = stations[0].url_resolved;
			}

			if (client.shoukaku.connections.has(guildId)) {
				console.log("Player already exists for guild, switching track.");
				const player = client.shoukaku.players.get(guildId);
				if (player) {
					const result = await player.node.rest.resolve(resourceUrl);
					client.radioInstances.delete(guildId);

					if (!result || result.loadType === "error") {
						return { id, action: "error" };
					}

					const trackResult = result as TrackResult;
					await player.playTrack({
						track: { encoded: trackResult.data.encoded },
					});

					client.radioInstances.set(guildId, {
						status: "switched",
						requestedBy: requesterId,
						radioStation: id,
						resourceUrl,
						voiceChannelId: channelId,
						executionDate: Date.now(),
					});

					return { id, action: "switched" };
				}
			}

			const player = await client.shoukaku.joinVoiceChannel({
				guildId,
				channelId,
				shardId: 0,
			});

			client.radioInstances.set(guildId, {
				status: "playing",
				requestedBy: requesterId,
				radioStation: id,
				resourceUrl,
				voiceChannelId: channelId,
				executionDate: Date.now(),
			});

			const result = await player.node.rest.resolve(resourceUrl);

			if (!result || result.loadType === "error") {
				return { id, action: "error" };
			}

			const trackResult = result as TrackResult;
			client.radioInstances.delete(guildId);

			await player.playTrack({ track: { encoded: trackResult.data.encoded } });

			client.radioInstances.set(guildId, {
				status: "playing",
				requestedBy: requesterId,
				radioStation: id,
				resourceUrl,
				voiceChannelId: channelId,
				executionDate: Date.now(),
			});

			return { id, action: "played" };
		} catch (e) {
			if (interaction) {
				await handleError(client, e as Error, interaction);
			} else {
				console.error(e);
			}
			throw e;
		}
	}
}
