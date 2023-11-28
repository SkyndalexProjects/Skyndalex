import { EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

export default async function voiceStateUpdate(client, oldState, newState) {
  const getSettings = await client.prisma.settings.findUnique({
    where: {
      guildId: newState.guild.id,
    },
  });

  if (getSettings?.voiceLogsChannel) {
    const embed = new EmbedBuilder().setColor("#0099ff");

    if (!oldState.channel && newState.channel) {
      embed.setDescription(
        `**${newState.member.user.username}** joined channel \`${newState.channel.name}\``,
      );
    } else if (oldState.channel && !newState.channel) {
      embed.setDescription(
        `**${newState.member.user.username}** left channel \`${oldState.channel.name}\``,
      );
    } else if (
      oldState.channel &&
      newState.channel &&
      oldState.channel !== newState.channel
    ) {
      embed.setDescription(
        `**${newState.member.user.username}** moved from \`${oldState.channel.name}\` to \`${newState.channel.name}\``,
      );
    }

    await client.channels.cache
      .get(getSettings.voiceLogsChannel)
      .send({ embeds: [embed] });
  }

  if (getSettings.radioEnabled) {
    if (getSettings.radioChannel) {
      if (!oldState.channel && newState.channel) {
        if (newState.channel.id !== getSettings.radioChannel) return;
        const id = getSettings.radioStation.split("-")[1];
        const url = `https://radio.garden/api/ara/content/channel/${id}`;
        const resourceUrl = `https://radio.garden/api/ara/content/listen/${id}/channel.mp3`;

        const fetchStation = await fetch(url, {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        });

        const json = await fetchStation.json();
        if (json.error === "Not found") return;

        const node = client.shoukaku.getNode();
        if (!node) return;

        const result = await node.rest.resolve(resourceUrl);
        if (!result?.tracks.length) return;
        const metadata = result.tracks.shift();

        const existingPlayer = node.players.has(oldState.guild.id);

        if (!existingPlayer) {
          const player = await node.joinChannel({
            guildId: oldState.guild.id,
            channelId: getSettings.radioChannel,
            shardId: 0,
          });

          await player.playTrack({ track: metadata.track }).setVolume(0.5);
        }
      } else if (oldState.channel && !newState.channel) {
        if (oldState.channel.members.size === 1) {
          const node = client.shoukaku.getNode();
          if (!node) return;

          const existingPlayer = node.players.has(oldState.guild.id);

          if (existingPlayer) {
            const currentPlayer = await node.players.get(oldState.guild.id);
            await currentPlayer.stopTrack();
            await node.leaveChannel(oldState.guild.id);
          }
        }
      }
    }
  }
}
