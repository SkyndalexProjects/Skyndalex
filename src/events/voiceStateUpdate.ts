import { SkyndalexClient } from "#classes";
import {
	type ColorResolvable,
	EmbedBuilder,
	NewsChannel,
	TextBasedChannel,
	VoiceState,
} from "discord.js";

export async function voiceStateUpdate(
	client: SkyndalexClient,
	oldState: VoiceState,
	newState: VoiceState,
) {
	const settings = await client.prisma.settings.findFirst({
		where: {
			guildId: newState.guild.id,
		},
	});

	const customBotSettings = await client.prisma.customBotSettings.findUnique({
		where: {
			guildId: newState.guild.id,
			clientId: client.user.id,
		},
	});

	let description = "";
	let color = "";

	const embed = new EmbedBuilder().setTimestamp();

	if (oldState.channel !== newState.channel) {
		if (!oldState.channel && newState.channel) {
			description = client.i18n.t("USER_JOINED", {
				lng: newState.guild.preferredLocale,
				user: newState.member.user.username,
				channelId: newState.channel.id,
			});

			color = "Green";

			if (client.user.id !== process.env.CLIENT_ID) {
				if (
					newState.channel.id ===
					customBotSettings?.autoRadioVoiceChannel
				) {
					if (!client.shoukaku.connections.has(newState.guild.id)) {
						await client.radio.startRadio(
							client,
							newState.guild.id,
						);
					}
				}
			} else {
				if (newState.channel.id === settings?.autoRadioVoiceChannel) {
					if (!client.shoukaku.connections.has(newState.guild.id)) {
						await client.radio.startRadio(
							client,
							newState.guild.id,
						);
					}
				}
			}
		} else if (oldState.channel && !newState.channel) {
			description = client.i18n.t("USER_LEFT", {
				lng: newState.guild.preferredLocale,
				user: newState.member.user.username,
				channelId: oldState.channel.id,
			});
			color = "Red";

			if (oldState.channel.members.size === 1) {
				await client.radio.stopRadio(client, newState.guild.id);
			}
		} else {
			description = client.i18n.t("USER_MOVED", {
				lng: newState.guild.preferredLocale,
				user: newState.member.user.username,
				oldChannelId: oldState.channel.id,
				newChannelId: newState.channel.id,
			});
			color = "Yellow";

			if (client.user.id !== process.env.CLIENT_ID) {
				if (
					newState.channel.id ===
					customBotSettings?.autoRadioVoiceChannel
				) {
					if (!client.shoukaku.connections.has(newState.guild.id)) {
						await client.radio.startRadio(
							client,
							newState.guild.id,
						);
					}
				} else if (oldState.channel.members.size <= 1) {
					await client.radio.stopRadio(client, newState.guild.id);
				}
			} else {
				if (newState.channel.id === settings?.autoRadioVoiceChannel) {
					if (!client.shoukaku.connections.has(newState.guild.id)) {
						await client.radio.startRadio(
							client,
							newState.guild.id,
						);
					}
				} else if (oldState.channel.members.size <= 1) {
					await client.radio.stopRadio(client, newState.guild.id);
				}
			}
		}
	}

	if (description) {
		embed.setDescription(description);
		embed.setColor(color as ColorResolvable);

		const channel = client.channels.cache.get(
			settings?.voiceStateUpdateChannel,
		) as TextBasedChannel;
		if (channel) {
			channel.send({ embeds: [embed] });
		}
	}
}
