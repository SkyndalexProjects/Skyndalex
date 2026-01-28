import {
    ActionRowBuilder,
    type AutocompleteInteraction,
    ButtonStyle,
    type ChatInputCommandInteraction, ContainerBuilder, MessageFlags,
    SectionBuilder, SeparatorBuilder, SeparatorSpacingSize,
    SlashCommandBuilder, TextDisplayBuilder,
} from "discord.js";
import { ButtonBuilder, EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import type {RadioBrowserStationQueryResult, radioStationSearchQueryResult} from "#types";

export async function run(
    client: SkyndalexClient,
    interaction: ChatInputCommandInteraction<"cached">,
) {
    try {
        await interaction.deferReply();

        const source1 = interaction.options.getString("source1");
        const source2 = interaction.options.getString("source2");

        const station = source1 ?? source2;
        const provider = source1 ? "radio.garden" : "radio-browser";

        type RadioDetailsJson = {
            data?: {
                title?: string;
                country?: { title?: string };
                place?: { title?: string };
                executionDate?: number;
            };
        };
        if (!station) {
            return await interaction.editReply({
                content: "Please provide a radio station source.",
            });
        }

        const memberChannel = interaction.member.voice.channel;
        if (!memberChannel) {
            return await interaction.editReply({
                content: `${client.i18n.t("RADIO_JOIN_VOICE_CHANNEL", {
                    lng: interaction.locale,
                })}`,
            });
        }

        const currentRadioAction = await client.radio.startRadio(
            client,
            station,
            interaction.guild.id,
            memberChannel.id,
            interaction.user.id,
            provider,
            interaction,
        );

        if (currentRadioAction.action === "error") {
            return await interaction.editReply({
                content: `${client.i18n.t("RADIO_STATION_NOT_FOUND", {
                    lng: interaction.locale,
                })}`,
            })
        }
        let radioDetailsJson: RadioDetailsJson = {};
        if (provider === "radio.garden") {
            const channelId = station.split('/').pop();
            const getRadioDetails = await fetch(`https://radio.garden/api/ara/content/channel/${channelId}/`, {
                method: "GET",
                headers: {
                    "Content-Type": "accept: application/json",
                }
            });
            radioDetailsJson = await getRadioDetails.json() as RadioDetailsJson;

            radioDetailsJson.data = radioDetailsJson.data ?? {};
            radioDetailsJson.data.executionDate = Date.now();
        } else if (provider === "radio-browser") {
            const response = await fetch(`https://de1.api.radio-browser.info/json/stations/byuuid/${station}`);
            const stations = (await response.json()) as RadioBrowserStationQueryResult[];
            console.log("radio.browser stations:", stations);
            if (stations && stations.length > 0) {
                const s = stations[0]
                radioDetailsJson = {
                    data: {
                        title: s.name,
                        country: { title: s.country },
                        place: { title: s.state || s.country },
                    }
                };
            }
        }

        client.radioInstances.set(interaction.guild.id, {
            requestedBy: interaction.user.id,
            requestedByAvatarURL: interaction.user.displayAvatarURL(),
            radioStation: radioDetailsJson?.data?.title ?? "Unknown",
            resourceUrl: station,
            voiceChannelId: memberChannel.id,
            executionDate: Date.now(),
        });

        const btn1 = new ButtonBuilder(client, interaction.locale)
            .setStyle(ButtonStyle.Primary)
            .setLabel("❤️")
            .setCustomId(`addLikedRadio`)

        const btn2 = new ButtonBuilder(client, interaction.locale)
            .setStyle(ButtonStyle.Danger)
            .setLabel("🛑")
            .setCustomId(`stopRadio`)

        const btn3 = new ButtonBuilder(client, interaction.locale)
            .setStyle(ButtonStyle.Success)
            .setLabel("▶️")
            .setCustomId('playRadio')
            .setDisabled(false);
        const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            btn3,
            btn1,
            btn2,
        );

        const dashboardTip = new TextDisplayBuilder().setContent(
            `-# 🔗 | Tip: You can manage the radio playback via [Dashboard](https://chuj.pl)\n-# ⚠️ | Be aware that some stations might have inaccurate metadata or might not work as expected.`,
        )
        const title = new TextDisplayBuilder().setContent("**Now Playing**")

        const desc = new TextDisplayBuilder().setContent(
                `📻 | Station: [\`${radioDetailsJson?.data?.title ?? "Unknown"}\`](https://chuj.pl)\n🌍 | Country: \`${radioDetailsJson?.data?.country?.title ?? "Unknown"}\`\n🏙️ | From city: **${radioDetailsJson?.data?.place?.title ?? "Unknown"}**\n🔊 | Voice Channel: <#${memberChannel.id}>\n💾 | Provider: \`${provider}\`\n`,
            )

        const footer = new TextDisplayBuilder().setContent(
            `-# 👍 | Do you like this station? Click the ❤️ button to add it to your liked stations!\n-# ❤️ | Enjoying the bot? Consider supporting us at [topgg](https://chuj.pl)`,
        )
        const separator = new SeparatorBuilder().setSpacing(
            SeparatorSpacingSize.Large,
        );
        const container = new ContainerBuilder()
            .addTextDisplayComponents(dashboardTip)
            .addSeparatorComponents(separator)
            .addTextDisplayComponents(title, desc, footer)
            .addSeparatorComponents(separator)
            .addActionRowComponents(actionRow);

        await interaction.editReply({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
        });

    } catch (e) {
        console.error(e);
    }
}

export const data = new SlashCommandBuilder()
    .setName("radio")
    .setDescription("Play a radio")
    .addStringOption((option) =>
        option
            .setName("source1")
            .setDescription("Play radio from radio.garden. Search by name/place/country")
            .setAutocomplete(true))
    .addStringOption((option) =>
        option
            .setName("source2")
            .setDescription("Play radio from radio-browser.info. Search by name/place/country")
            .setAutocomplete(true)
    );

export async function autocomplete(interaction: AutocompleteInteraction) {
    const focused = interaction.options.getFocused(true);
    const focusedValue = focused.value;
    const focusedName = focused.name;

    if (!focusedValue) {
        return await interaction.respond([]);
    }

    const data: { name: string; value: string }[] = [];

    if (focusedName === "source1") {
        const url = `https://radio.garden/api/search?q=${encodeURIComponent(focusedValue)}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        const jsonResponse = (await response.json()) as radioStationSearchQueryResult;

        for (const radioStation of jsonResponse.hits.hits) {
            if (radioStation._source.type !== "channel") continue;

            const source = radioStation._source as {
                code: string;
                subtitle: string;
                type: string;
                title: string;
                secure: boolean;
                url: string;
                page: { title: string; url: string };
            };

            data.push({
                name: source.page.title,
                value: source.page.url,
            });
        }

        await interaction.respond(data.slice(0, 25));
        return;
    } else if (focusedName === "source2") {
        const url = `https://de1.api.radio-browser.info/json/stations/byname/${encodeURIComponent(focusedValue)}?limit=25`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        const jsonResponse = (await response.json()) as RadioBrowserStationQueryResult[];
        for (const station of jsonResponse) {
            if (!station.url_resolved) continue;

            data.push({
                name: `${station.name} (${station.country})`.slice(0, 100),
                value: station.stationuuid,
            });
        }

        await interaction.respond(data.slice(0, 25));
        return;
    }
}