import { EmbedBuilder } from 'discord.js';

export async function guildMemberAdd(client, member) {
    const getSettings = await client.prisma.settings.findUnique({
        where: {
            guildId: member.guild.id
        }
    });

    const welcomeEmbed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`**${member.user.username}** joined the server.`);

    if (getSettings?.autoRole) {
        const role = member.guild.roles.cache.get(getSettings.autoRole);
        if (role) {
            member.roles.add(role);

            welcomeEmbed.setDescription(
                `**${member.user.username}** joined the server and got the role **${role.name}**`
            );
        }
    }

    if (getSettings?.welcomeChannel) {
        await client.channels.cache.get(getSettings.welcomeChannel).send({ embeds: [welcomeEmbed] });
    }
}
