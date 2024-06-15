import type { SkyndalexClient } from "#classes";
import type {
 StringSelectMenuInteraction,
} from "discord.js";
import type { TrackResult } from "shoukaku";

export async function run(
	client: SkyndalexClient,
	interaction: StringSelectMenuInteraction<'cached'>,
) {
	const value = interaction.values[0];
    
    const memberChannel = interaction.member.voice.channel;

    if (!memberChannel) {
        return await interaction.reply({
            content: `${client.i18n.t("RADIO_JOIN_VOICE_CHANNEL", {
                lng: interaction.locale,
            })}`,
        });
    }

    const resourceUrl = `https://radio.garden/api/ara/content/listen/${value}/channel.mp3`;

    if (client.shoukaku.connections.has(interaction.guild.id)) {
        const player = client.shoukaku.players.get(interaction.guild.id);
        const result = (await player.node.rest.resolve(
            resourceUrl,
        )) as TrackResult;
        await player.playTrack({ track: result.data.encoded });


        return interaction.reply({
            content: `🔁 Switched to **${result.data.info.title}**`,
            ephemeral: true,
        });
    }

    const player = await client.shoukaku.joinVoiceChannel({
        guildId: interaction.guild.id,
        channelId: memberChannel.id,
        shardId: 0,
    });

    const result = (await player.node.rest.resolve(
        resourceUrl,
    )) as TrackResult;

    await player.playTrack({ track: result.data.encoded });

    return interaction.reply({
        content: `▶️ Playing **${result.data.info.title}**`,
        ephemeral: true,
    });
}
