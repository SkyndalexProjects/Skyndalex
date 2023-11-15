import { Embed, EmbedBuilder } from "discord.js";

export default async function voiceStateUpdate(client, oldState, newState) {
  const getVoiceChannel = await client.prisma.settings.findUnique({
    where: {
      guildId: newState.guild.id,
    },
  });

  if (getVoiceChannel?.voiceLogsChannel) {
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
      .get(getVoiceChannel.voiceLogsChannel)
      .send({ embeds: [embed] });
  }
}
