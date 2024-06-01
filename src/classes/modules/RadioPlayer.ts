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
			const channel = client?.channels?.cache?.get(
				settings?.autoRadioVoiceChannel,
			);

			if (channel.id && settings.radioStation) {
				const resourceUrl = `https://radio.garden/api/ara/content/listen/${settings.radioStation}/channel.mp3`;

				const player = await client.shoukaku.joinVoiceChannel({
					guildId: guildId,
					channelId: channel.id,
					shardId: 0,
				});

				const result = await player.node.rest.resolve(resourceUrl);

				await player.playTrack({ track: result.data.encoded });
			}
		} catch (e) {
			console.error(e);
		}
	}
	async stopRadio(client, guildId) {
		await client.shoukaku.leaveVoiceChannel(guildId);
	}
}
