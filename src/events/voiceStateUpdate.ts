import { type ColorResolvable, EmbedBuilder } from "discord.js";
export async function voiceStateUpdate(client, oldState, newState) {
	const settings = await client.prisma.settings.findFirst({
		where: {
			guildId: newState.guild.id,
		},
	});

	let description = "";
	let color = "";

	const embed = new EmbedBuilder().setTimestamp();

	if (oldState.channel !== newState.channel) {
		if (!oldState.channel && newState.channel) {
			description = `User ${newState.member.user.username} **joined channel** <#${newState.channel.id}> \`[${newState.channel.name}]\``;
			color = "Green";

			if (newState.channel.id === settings?.autoRadioVoiceChannel) {
				if (client.shoukaku.connections.size <= 0) {
					await client.radio.startRadio(client, newState.guild.id);
				}
			}
		} else if (oldState.channel && !newState.channel) {
			description = `User ${newState.member.user.username} **left channel** <#${oldState.channel.id}> \`[${oldState.channel.name}]\``;
			color = "Green";

			if (oldState.channel.members.size === 1) {
				await client.radio.stopRadio(client, newState.guild.id);
			}
		} else {
			description = `User ${newState.member.user.username} **moved from** <#${oldState.channel.id}> \`[${newState.channel.name}]\` to <#${newState.channel.id}> [${newState.channel.name}]`;
			color = "Yellow";

			if (newState.channel.id === settings?.autoRadioVoiceChannel) {
				await client.radio.startRadio(client, newState.guild.id);
			} else if (oldState.channel.members.size <= 1) {
				await client.radio.stopRadio(client, newState.guild.id);
			}
		}
	}

	if (description) {
		embed.setDescription(description);
		embed.setColor(color as ColorResolvable);

		client.channels.cache.get(settings)?.send({ embeds: [embed] });
	}
}
