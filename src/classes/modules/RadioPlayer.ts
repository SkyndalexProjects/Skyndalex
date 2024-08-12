import type { SkyndalexClient } from "../Client.js";

export class RadioPlayer {
	constructor(private readonly client: SkyndalexClient) {
		this.client = client;
	}

	async startRadio(client, guildId) {
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

				const result = await player.node.rest.resolve(resourceUrl);

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

	async stopRadio(client, guildId) {
		await client.shoukaku.leaveVoiceChannel(guildId);
		client.shoukaku.connections.delete(guildId);
	}
}
