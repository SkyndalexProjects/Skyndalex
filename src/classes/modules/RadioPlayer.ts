import type { SkyndalexClient } from "../Client.js";
import type { TrackResult } from "shoukaku";
import type { radioStationData } from "#types";

export class RadioPlayer {
	constructor(private readonly client: SkyndalexClient) {
		this.client = client;
	}

	async autoStart(client: SkyndalexClient, guildId: string) {
		try {
			const settings = await client.prisma.settings.findFirst({
				where: {
					guildId: guildId,
				},
			});
			const customBotSettings =
				await client.prisma.customBotSettings.findUnique({
					where: {
						guildId: guildId,
						clientId: client.user.id,
					},
				});
			let channel = client?.channels?.cache?.get(
				settings?.autoRadioVoiceChannel,
			);
			let radioStation = settings?.radioStation;

			if (client.user.id !== process.env.CLIENT_ID) {
				channel = client?.channels?.cache?.get(
					customBotSettings?.autoRadioVoiceChannel,
				);
				radioStation = customBotSettings?.radioStation;
			}

			if (channel?.id && radioStation) {
				const resourceUrl = `https://radio.garden/api/ara/content/listen/${radioStation}/channel.mp3`;

				const player = await client.shoukaku.joinVoiceChannel({
					guildId: guildId,
					channelId: channel.id,
					shardId: 0,
				});

				client.radioInstances.set(guildId, {
					requestedBy: client.user.id,
					radioStation,
					resourceUrl,
				});

				const result = (await player.node.rest.resolve(
					resourceUrl,
				)) as TrackResult;

				await player.playTrack({ track: result.data.encoded });
			} else {
				client.logger.log(
					`No channel or radio station found for guild ${guildId}`,
				);
			}
		} catch (e) {
			console.error(e);
		}
	}

	async startRadio(
		client: SkyndalexClient,
		station: string,
		guildId: string,
		channelId: string,
		requesterId: string,
	) {
		const url = `https://radio.garden/api/ara/content/channel/${station}`;

		const response = await fetch(url, {
			method: "GET",
			headers: {
				accept: "application/json",
			},
		});

		const json = (await response.json()) as radioStationData;

		if (json.error) return null;

		const id = json.data.url.split("/")[3];

		const resourceUrl = `https://radio.garden/api/ara/content/listen/${id}/channel.mp3`;

		if (client.shoukaku.connections.has(guildId)) {
			const player = client.shoukaku.players.get(guildId);
			const result = (await player.node.rest.resolve(
				resourceUrl,
			)) as TrackResult;

			client.radioInstances.delete(guildId);

			await player.playTrack({ track: result.data.encoded });

			client.radioInstances.set(guildId, {
				requestedBy: requesterId,
				radioStation: id,
				resourceUrl,
			});

			return { json, action: "switched" };
		}

		const player = await client.shoukaku.joinVoiceChannel({
			guildId,
			channelId,
			shardId: 0,
		});

		client.radioInstances.set(guildId, {
			requestedBy: requesterId,
			radioStation: id,
			resourceUrl,
		});

		const result = (await player.node.rest.resolve(
			resourceUrl,
		)) as TrackResult;

		client.radioInstances.delete(guildId);

		await player.playTrack({ track: result.data.encoded });

		client.radioInstances.set(guildId, {
			requestedBy: requesterId,
			radioStation: id,
			resourceUrl,
		});

		return { json, action: "played" };
	}
	async stopRadio(client: SkyndalexClient, guildId: string) {
		await client.shoukaku.leaveVoiceChannel(guildId);
		client.shoukaku.connections.delete(guildId);
	}
}
