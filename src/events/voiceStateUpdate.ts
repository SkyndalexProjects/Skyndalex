import { SkyndalexClient } from "#classes";
import { type ColorResolvable, EmbedBuilder, VoiceState } from "discord.js";

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
			description = `User ${newState.member.user.username} **joined channel** <#${newState.channel.id}> \`[${newState.channel.name}]\``;
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
			description = `User ${newState.member.user.username} **left channel** <#${oldState.channel.id}> \`[${oldState.channel.name}]\``;
			color = "Green";

			if (oldState.channel.members.size === 1) {
				await client.radio.stopRadio(client, newState.guild.id);
			}
		} else {
			description = `User ${newState.member.user.username} **moved from** <#${oldState.channel.id}> \`[${oldState.channel.name}]\` to <#${newState.channel.id}> [${newState.channel.name}]`;
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

		// @ts-expect-error
		client.channels.cache.get(settings)?.send({ embeds: [embed] });
	}
}
