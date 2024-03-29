import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';
import createPlayer from '../../functions/player.js';
export async function run(client, interaction) {
    await interaction.deferReply();
    const tiktok_url = interaction.options.getString('url');
    const custom_title = interaction.options.getString('custom_title');

    const validDomains = ['tiktok.com', 'soundcloud.com', 'on.soundcloud.com', 'm.soundcloud.com', 'www.tiktok.com'];
    const url = new URL(tiktok_url);
    if (!validDomains.includes(url.hostname)) {
        return await interaction.followUp(
            `Wrong domain. Only TikTok and SoundCloud are accepted by the bot!\n\n**You provided:**\n\`${url.hostname}\`\n**Full string:**\n\`${tiktok_url}\``
        );
    }

    const res = await fetch(`https://co.wuk.sh/api/json`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url: encodeURI(tiktok_url),
            disableMetadata: false
        })
    });

    const json = await res.json();
    console.log('json', json);
    const embedError = new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription(
            `Error while fetching ${url.hostname} sound from ${tiktok_url}.\n\n**Error title:**\n\`${json.text}\``
        )
        .setColor('Red');

    if (json.status === 'error') {
        return interaction.editReply({ embeds: [embedError] });
    }

    const memberChannel = interaction.member.voice.channel;
    if (!memberChannel) {
        return await interaction.editReply(
            `Hey, ${interaction.user.tag}! You must be in a voice channel to use this command.`
        );
    }

    const resourceUrl = json.url || json.audio;

    await createPlayer(
        client,
        interaction,
        resourceUrl,
        interaction.guild.id,
        memberChannel.id,
        tiktok_url,
        url.hostname,
        custom_title
    );
}
export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play TikTok/Soundcloud sound.')
    .addStringOption(option => option.setName('url').setDescription('Tiktok/Soundcloud URL').setRequired(true))
    .addStringOption(option =>
        option.setName('custom_title').setDescription('Custom title for the song').setRequired(false)
    );
