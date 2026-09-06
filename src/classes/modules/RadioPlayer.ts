import http from "node:http";
import https from "node:https";
import { RadioProvider } from "@prisma/client";
import type {
	ChatInputCommandInteraction,
	MessageComponentInteraction,
} from "discord.js";
import type { Player, TrackResult } from "shoukaku";
import type { SkyndalexClient } from "#classes";

interface IcyMetadataResult {
	streamTitle?: string;
	icyName?: string;
}

export class RadioPlayer {
	constructor(readonly client: SkyndalexClient) {
		this.client = client;
	}

	private async playAndSetup(
		player: Player,
		resourceUrl: string,
		client: SkyndalexClient,
		guildId: string,
		status: "switched" | "playing",
		requesterId: string,
		id: string,
		stationSource: string,
		provider: RadioProvider,
		channelId: string,
		textChannelId?: string,
	): Promise<{ id: string; action: string } | null> {
		const result = await player.node.rest.resolve(resourceUrl);

		if (!result || result.loadType === "error" || result.loadType === "empty") {
			return { id, action: "error" };
		}

		const trackResult = result as TrackResult;

		if (!trackResult.data) {
			return { id, action: "error" };
		}

		await player.playTrack({
			track: { encoded: trackResult.data.encoded },
		});

		// Ustaw stan PRZED wysłaniem broadcastu, żeby dashboard nie dostał stale danych
		client.radioStateManager.setInstance(guildId, {
			status,
			requestedBy: requesterId,
			radioStation: id,
			stationSource,
			resourceUrl,
			voiceChannelId: channelId,
			textChannelId: textChannelId ?? channelId,
			executionDate: Date.now(),
			provider,
		});

		client.dashboard.broadcastRadioUpdate(guildId, "radio_updated");

		return null;
	}

	async startRadio(
		client: SkyndalexClient,
		station: string,
		guildId: string,
		channelId: string,
		requesterId: string,
		provider: RadioProvider,
		interaction?: ChatInputCommandInteraction | MessageComponentInteraction,
	) {
		try {
			let resourceUrl: string;
			let id: string;

			if (provider === RadioProvider.RADIO_GARDEN) {
				id = (() => {
					const lastSegment = station.match(/\/([^/?#]+)(?:[?#].*)?$/);
					if (lastSegment?.[1]) return lastSegment[1];

					const rgMatch = station.match(/\/listen\/[^/]+\/([^/?#]+)/);
					// if (rgMatch && rgMatch[1]) return rgMatch[1];
					if (rgMatch?.[1]) return rgMatch[1];
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
				const player = client.shoukaku.players.get(guildId);
				if (player) {
					const error = await this.playAndSetup(
						player,
						resourceUrl,
						client,
						guildId,
						"switched",
						requesterId,
						id,
						station,
						provider,
						channelId,
						interaction?.channel?.id,
					);
					if (error) return error;

					return { id, action: "switched" };
				}
			}

			const player = await client.shoukaku.joinVoiceChannel({
				guildId,
				channelId,
				shardId: 0,
			});

			const error = await this.playAndSetup(
				player,
				resourceUrl,
				client,
				guildId,
				"playing",
				requesterId,
				id,
				station,
				provider,
				channelId,
				interaction?.channel?.id,
			);
			if (error) return error;

			return { id, action: "played" };
		} catch (e) {
			if (interaction) {
				await client.errorHandling.handleUnexpectedError(
					client,
					e as Error,
					interaction,
				);
			} else {
				console.error(e);
			}
			throw e;
		}
	}

	async fetchCurrentlyPlayingSong(
		streamUrl: string,
		timeoutMs = 5000,
		redirectsLeft = 5,
	): Promise<IcyMetadataResult> {
		return new Promise((resolve) => {
			let settled = false;
			let overallTimeout: NodeJS.Timeout | undefined;

			const finish = (result: IcyMetadataResult) => {
				if (settled) return;
				settled = true;
				if (overallTimeout) clearTimeout(overallTimeout);
				resolve(result);
			};

			let parsedUrl: URL;
			try {
				parsedUrl = new URL(streamUrl);
			} catch {
				return finish({});
			}

			const lib = parsedUrl.protocol === "https:" ? https : http;

			const req = lib.get(
				streamUrl,
				{
					headers: {
						"Icy-MetaData": "1",
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
					},
					timeout: timeoutMs,
				},
				(res) => {
					if (
						res.statusCode &&
						res.statusCode >= 300 &&
						res.statusCode < 400 &&
						res.headers.location &&
						redirectsLeft > 0
					) {
						res.destroy();
						this.fetchCurrentlyPlayingSong(
							new URL(res.headers.location, streamUrl).toString(),
							timeoutMs,
							redirectsLeft - 1,
						).then(finish);
						return;
					}

					const icyName = res.headers["icy-name"] as string | undefined;
					const metaintHeader = res.headers["icy-metaint"];
					const metaint = metaintHeader
						? Number.parseInt(metaintHeader as string, 10)
						: Number.NaN;

					if (!metaint || Number.isNaN(metaint)) {
						res.destroy();
						return finish({ icyName });
					}

					let bytesRead = 0;
					let mode: "audio" | "metaLength" | "metaData" = "audio";
					let metaDataLength = 0;
					let metaDataBuffer = Buffer.alloc(0);

					res.on("data", (chunk: Buffer) => {
						let offset = 0;

						while (offset < chunk.length) {
							if (mode === "audio") {
								const remainingAudio = metaint - bytesRead;
								const toSkip = Math.min(remainingAudio, chunk.length - offset);
								bytesRead += toSkip;
								offset += toSkip;

								if (bytesRead >= metaint) {
									mode = "metaLength";
									bytesRead = 0;
								}
							} else if (mode === "metaLength") {
								metaDataLength = chunk[offset] * 16;
								offset += 1;
								metaDataBuffer = Buffer.alloc(0);

								if (metaDataLength === 0) {
									mode = "audio";
									bytesRead = 0;
								} else {
									mode = "metaData";
								}
							} else {
								const remainingMeta = metaDataLength - metaDataBuffer.length;
								const toRead = Math.min(remainingMeta, chunk.length - offset);
								metaDataBuffer = Buffer.concat([
									metaDataBuffer,
									chunk.subarray(offset, offset + toRead),
								]);
								offset += toRead;

								if (metaDataBuffer.length >= metaDataLength) {
									const metaString = metaDataBuffer.toString("utf8");
									const match = /StreamTitle='([^']*)'/.exec(metaString);
									req.destroy();
									res.destroy();
									return finish({
										streamTitle: match?.[1]?.trim(),
										icyName,
									});
								}
							}
						}
					});

					res.on("end", () => finish({ icyName }));
					res.on("error", () => finish({ icyName }));
				},
			);

			req.on("error", () => finish({}));
			req.on("timeout", () => {
				req.destroy();
				finish({});
			});

			overallTimeout = setTimeout(() => {
				req.destroy();
				finish({});
			}, timeoutMs + 1000);
		});
	}
}
