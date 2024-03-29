import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export default async function createPlayer(
    client,
    interaction,
    resourceUrl,
    ExistingPlayerValue,
    channelMember,
    tiktok_url,
    url_hostname,
    custom_title
) {
    const playAgainButton = new ButtonBuilder()
        .setCustomId(`play`)
        .setLabel('Play again')
        .setStyle(ButtonStyle.Success);

    const playingEmbed = new EmbedBuilder()
        .setTitle(`✅ Playing *${custom_title || url_hostname}* sound`)
        .setDescription(`Playing ${url_hostname} sound from ${tiktok_url}`)
        .setColor('Green');

    const finishedPlayingSongEmbed = new EmbedBuilder()
        .setTitle(`✅ Finished playing *${custom_title || url_hostname}* sound`)
        .setDescription(`Finished playing ${url_hostname} sound from ${tiktok_url}`)
        .setColor('Green');

    const songSwitchedEmbed = new EmbedBuilder()
        .setTitle(`🔀 Switched to *${custom_title || url_hostname}* sound`)
        .setDescription(`Switched to ${url_hostname} sound from ${tiktok_url}`)
        .setColor('Green');

    const node = client.shoukaku.getNode();
    if (!node) return;

    const result = await node.rest.resolve(resourceUrl);
    if (!result?.tracks.length) return;
    const metadata = result.tracks.shift();

    const existingPlayer = node.players.has(ExistingPlayerValue);

    if (!existingPlayer) {
        await interaction.editReply({
            fetchReply: true,
            embeds: [playingEmbed],
            files: [new AttachmentBuilder().setFile(resourceUrl).setName('skyndalex.xyz.mp3')],
            components: [new ActionRowBuilder().addComponents(playAgainButton)]
        });

        const player = await node.joinChannel({
            guildId: interaction.guild.id,
            channelId: channelMember,
            shardId: 0
        });

        if (!player)
            return interaction.editReply(
                `Something went wrong while joining the channel. Probably connection is still connecting, or bot is already connected to the other voice channel.`
            );

        await player.playTrack({ track: metadata.track }).setVolume(0.5);
    } else {
        await interaction.editReply({
            embeds: [songSwitchedEmbed],
            content: `<@${interaction.user.id}>`,
            files: [new AttachmentBuilder().setFile(resourceUrl).setName('skyndalex.xyz.mp3')],
            components: [new ActionRowBuilder().addComponents(playAgainButton)]
        });

        const currentPlayer = await node.players.get(interaction.guild.id);

        if (!currentPlayer)
            return interaction.editReply(
                `Something went wrong while joining the channel. Probably connection is still connecting, or bot is already connected to the other voice channel.`
            );

        await currentPlayer.stopTrack();
        await currentPlayer.playTrack({ track: metadata.track }).setVolume(0.5);
    }
}
