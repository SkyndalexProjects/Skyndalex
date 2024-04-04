import { EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

export async function voiceStateUpdate(client, oldState, newState) {
	const getSettings = await client.prisma.settings.findUnique({
		where: {
			guildId: newState.guild.id,
		},
	});

	if (getSettings?.voiceLogsChannel) {
		const embed = new EmbedBuilder();
		let description = "";
		let color = "";

		if (oldState.channel !== newState.channel) {
			if (!oldState.channel && newState.channel) {
				description = `**${newState.member.user.username}** joined channel \`${newState.channel.name}\``;
				color = `Green`;
			} else if (oldState.channel && !newState.channel) {
				description = `**${newState.member.user.username}** left channel \`${oldState.channel.name}\``;
				color = `Red`;
			} else {
				description = `**${newState.member.user.username}** moved from \`${oldState.channel.name}\` to \`${newState.channel.name}\``;
				color = `Blurple`;
			}
		} else if (oldState.serverMute !== newState.serverMute) {
			const action = newState.serverMute ? "guild-muted" : "guild-unmuted";
			description = `**${newState.member.user.username}** was ${action} in \`${newState.channel.name}\``;
			color = action === "guild-muted" ? `Red` : `Green`;
		} else if (oldState.serverDeaf !== newState.serverDeaf) {
			const action = newState.serverDeaf
				? "guild-deafened"
				: "guild-undeafened";
			description = `**${newState.member.user.username}** was ${action} in \`${newState.channel.name}\``;
			color = action === "guild-deafened" ? `Red` : `Green`;
		} else if (oldState.selfMute !== newState.selfMute) {
			const action = newState.selfMute ? "self-muted" : "self-unmuted";
			description = `**${newState.member.user.username}** was ${action} in \`${newState.channel.name}\``;
			color = action === "self-muted" ? `Yellow` : `Green`;
		} else if (oldState.selfDeaf !== newState.selfDeaf) {
			const action = newState.selfDeaf ? "self-deafened" : "self-undeafened";
			description = `**${newState.member.user.username}** was ${action} in \`${newState.channel.name}\``;
			color = action === "self-deafened" ? `Red` : `Green`;
		} else if (oldState.streaming !== newState.streaming) {
			const action = newState.streaming
				? "started streaming"
				: "stopped streaming";
			description = `**${newState.member.user.username}** ${action} in \`${newState.channel.name}\``;
			color = action === "started streaming" ? `Green` : `Red`;
		}

		if (description) {
			embed.setDescription(description);
			embed.setColor(color);
			await client.channels.cache
				.get(getSettings.voiceLogsChannel)
				.send({ embeds: [embed] });
		}
	}

	if (
		getSettings?.radioEnabled &&
		getSettings?.radioChannelVoice &&
		newState.channel &&
		newState.channel.id === getSettings.radioChannelVoice
	) {
		const id = getSettings.radioStation;
		const url = `https://radio.garden/api/ara/content/channel/${id}`;
		const resourceUrl = `https://radio.garden/api/ara/content/listen/${id}/channel.mp3`;

		const fetchStation = await fetch(url, {
			method: "GET",
			headers: {
				accept: "application/json",
			},
		});

		const json = await fetchStation.json();
		if (json.error === "Not found") return client.logger.error("Radio station not found.", json);

		const node = client.shoukaku.getNode();
		if (!node) return;

		const result = await node.rest.resolve(resourceUrl);
		if (!result?.tracks.length) return;
		const metadata = result.tracks.shift();

		const existingPlayer = node.players.has(oldState.guild.id);

		if (!existingPlayer) {
			const player = await node.joinChannel({
				guildId: oldState.guild.id,
				channelId: getSettings.radioChannelVoice,
				shardId: 0,
			});

			console.log("player", player)
			await player.playTrack({ track: metadata.track }).setVolume(0.5);
		}
	}

	const stoppedSong = new EmbedBuilder()
		.setTitle(`👋 Stopped playing song. (AUTO)`)
		.setDescription(`**Reason:** *All users left the voice channel.*`)
		.setTimestamp()
		.setColor("Red");

	if (
		oldState.channel &&
		(!newState.channel || oldState.channel.id !== newState.channel.id)
	) {
		if (oldState.channel.members.size === 1) {
			const node = client.shoukaku.getNode();
			if (!node) return;

			const existingPlayer = node.players.has(oldState.guild.id);

			if (existingPlayer) {
				const currentPlayer = await node.players.get(oldState.guild.id);
				await currentPlayer.stopTrack();
				await node.leaveChannel(oldState.guild.id);

				if (getSettings?.voiceLogsChannel)
					await client.channels.cache
						.get(getSettings?.voiceLogsChannel)
						.send({ embeds: [stoppedSong] });
			}
		}
	}
}