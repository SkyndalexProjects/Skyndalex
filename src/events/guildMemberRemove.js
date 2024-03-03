import { EmbedBuilder } from "discord.js";

export default async function guildMemberRemove(client, member) {
  const getSettings = await client.prisma.settings.findUnique({
    where: {
      guildId: member.guild.id,
    },
  });

  if (getSettings?.leaveChannel) {
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setDescription(`**${member.user.username}** left the server`);

    await client.channels.cache
      .get(getSettings.leaveChannel)
      .send({ embeds: [embed] });
  }
}
