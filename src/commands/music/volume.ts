import {
    type ChatInputCommandInteraction, MessageFlags,
    SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
    client: SkyndalexClient,
    interaction: ChatInputCommandInteraction<"cached">,
) {
    const volumeValue = interaction.options.getInteger("value", true);
    const player = client.shoukaku.players.get(interaction.guild.id);

    if (!player) {
        return await interaction.reply({
            content: `${client.i18n.t("VOLUME_NO_ACTIVE_PLAYER", {
                lng: interaction.locale,
            })}`,
            flags: MessageFlags.Ephemeral
        });
    } else {
        await player.setGlobalVolume(volumeValue);

        await player.setEqualizer([
            { band: 0, gain: 0.25 },
            { band: 1, gain: 0.20 },
            { band: 2, gain: 0.15 },
            { band: 3, gain: 0.10 }
        ]);
        //
        // await player.setKaraoke({
        //     level: 1.75,
        //     monoLevel: 1.0,
        //     filterBand: 220,
        //     filterWidth: 100
        // });
        //
        // await player.setDistortion({
        //     sinOffset: 0.0,
        //     sinScale: 0.5,
        //     cosOffset: 0.0,
        //     cosScale: 0.5,
        //     tanOffset: 0.0,
        //     tanScale: 0.5,
        //     offset: 0.0,
        //     scale: 0.75
        // });
    }

    return await interaction.reply({
        content: `${client.i18n.t("VOLUME_SET_SUCCESS", {
            volume: volumeValue,
            lng: interaction.locale,
        })}`,
    })

}

export const data = new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Change the volume of the current radio playback")
    .addIntegerOption((option) =>
        option
            .setName("value")
            .setDescription("Volume value between 0 and 100")
            .setRequired(true)
            .setMinValue(0)
            .setMaxValue(1000))