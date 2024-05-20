import type { SkyndalexClient } from "../Client";
import {
	createAudioPlayer,
	createAudioResource,
	getVoiceConnection,
	joinVoiceChannel,
} from "@discordjs/voice";
import { fetch } from "undici";
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

				const connection = joinVoiceChannel({
					channelId: channel.id,
					guildId: guildId,
					adapterCreator: channel.guild.voiceAdapterCreator,
				});

				const player = createAudioPlayer();
				connection.subscribe(player);

				const stream = await fetch(resourceUrl).then((res) => res.body);
				const resource = createAudioResource(stream, {
					seek: 0,
					volume: 1,
				});

				player.play(resource);
			}
		} catch (e) {
			console.error(e);
		}
	}
	async stopRadio(client, guildId) {
		const settings = await client.prisma.settings.findFirst({
			where: {
				guildId: guildId,
			},
		});

		const channel = client?.channels?.cache?.get(
			settings?.autoRadioVoiceChannel,
		);

		const connection = await getVoiceConnection(channel.guild.id);
		if (connection) {
			connection.destroy();
		}
	}
}
