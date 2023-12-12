import { EmbedBuilder } from "discord.js";

export default async function guildMemberAdd(client, member) {
  const getSettings = await client.prisma.settings.findUnique({
    where: {
      guildId: member.guild.id,
    },
  });

  const welcomeEmbed = new EmbedBuilder()
    .setColor("Green")
    .setDescription(`**${member.user.username}** joined the server.`);

  if (getSettings?.autoRole) {
    const role = member.guild.roles.cache.get(getSettings.autoRole);
    if (role) {
      member.roles.add(role);

      welcomeEmbed.setDescription(
        `**${member.user.username}** joined the server and got the role **${role.name}**`,
      );
    }
  }

  if (getSettings?.welcomeChannel) {
    await client.channels.cache
      .get(getSettings.welcomeChannel)
      .send({ embeds: [welcomeEmbed] });
  } else {
    if (getSettings?.leaveChannel) {
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setDescription(`**${member.user.username}** left the server`);

      await client.channels.cache
        .get(getSettings.leaveChannel)
        .send({ embeds: [embed] });
    }
  }
}
