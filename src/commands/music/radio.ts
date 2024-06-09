import {
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";
import type { radioStationSearchQueryResult, radioStationData } from "#types";
import type { TrackResult } from "shoukaku";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	try {
		await interaction.deferReply();
		const station = interaction.options.getString("station");
		const memberChannel = interaction.member.voice.channel;

		if (!memberChannel) {
			return await interaction.editReply({
				content: `${client.i18n.t("RADIO_JOIN_VOICE_CHANNEL", {
					lng: interaction.locale,
				})}`,
			});
		}

		const url = `https://radio.garden/api/ara/content/channel/${station}`;

		const response = await fetch(url, {
			method: "GET",
			headers: {
				accept: "application/json",
			},
		});
		const json = (await response.json()) as radioStationData;

		if (json.error)
			return interaction.editReply({
				content: client.i18n.t("RADIO_STATION_NOT_FOUND", {
					lng: interaction.locale,
				}),
			});

		const id = json.data.url.split("/")[3];
		const resourceUrl = `https://radio.garden/api/ara/content/listen/${id}/channel.mp3`;

		const embed = new EmbedBuilder(client, interaction.locale)
			.setDescription("RADIO_PLAYING_DESC", {
				radioStation: json.data.title,
				radioCountry: json.data.country.title,
				radioPlace: json.data.place.title,
			})
			.setFooter({
				text: "RADIO_PLAYING_FOOTER",
				textArgs: { radioWebsite: json.data.website },
			})
			.setTimestamp();

		if (client.shoukaku.connections.has(interaction.guild.id)) {
			const player = client.shoukaku.players.get(interaction.guild.id);
			const result = (await player.node.rest.resolve(
				resourceUrl,
			)) as TrackResult;
			await player.playTrack({ track: result.data.encoded });

			embed.setTitle("RADIO_CHANGED").setColor("Blue");
			return interaction.editReply({
				embeds: [embed],
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

		embed.setTitle("RADIO_PLAYING").setColor("Gold");
		return interaction.editReply({
			embeds: [embed],
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
			.setName("station")
			.setDescription("Radio station")
			.setAutocomplete(true)
			.setRequired(true),
	);

export async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedValue = interaction.options.getFocused(true).value;
	const url = `https://radio.garden/api/search?q=${focusedValue}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "accept: application/json",
		},
	});

	const jsonResponse = (await response.json()) as radioStationSearchQueryResult;

	const data = [];

	for (const radioStation of jsonResponse.hits.hits) {
		if (radioStation._source.type !== "channel") continue;

		const id = radioStation._source.url.split("/")[3];
		data.push({ name: radioStation._source.title, value: id });
	}
	await interaction.respond(data);
}
