import {
	ActionRowBuilder,
	type AutocompleteInteraction,
	ButtonStyle,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { TrackResult } from "shoukaku";
import { ButtonBuilder, EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import type { radioStationData, radioStationSearchQueryResult } from "#types";

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

		const playRadio = await client.radio.startRadio(
			client,
			station,
			interaction.guild.id,
			memberChannel.id,
			interaction.user.id,
		);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder(client, interaction.locale)
				.setStyle(ButtonStyle.Success)
				.setLabel("RADIO_FAVORITE_ADD")
				.setCustomId(`addFavorite-${playRadio.json.data.id}`),
		);

		const embed = new EmbedBuilder(client, interaction.locale)
			.setTitle("RADIO_PLAYING")
			.setColor("Green")
			.setDescription("RADIO_PLAYING_DESC", {
				radioStation: playRadio.json.data.title,
				radioCountry: playRadio.json.data.country.title,
				radioPlace: playRadio.json.data.place.title,
			})
			.setFooter({
				text: "RADIO_PLAYING_FOOTER",
				textArgs: {
					radioWebsite: decodeURIComponent(
						playRadio.json.data.website,
					),
				},
			})
			.setTimestamp();

		if (playRadio.action === "switched") {
			embed.setTitle("RADIO_CHANGED");
			embed.setColor("Blue");
		}

		return interaction.editReply({
			embeds: [embed],
			components: [row],
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
			.setDescription("Radio station. Search by place/country/name")
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

	const jsonResponse =
		(await response.json()) as radioStationSearchQueryResult;

	const data = [];

	for (const radioStation of jsonResponse.hits.hits) {
		if (radioStation._source.type !== "channel") continue;

		const id = radioStation._source.url.split("/")[3];
		data.push({ name: radioStation._source.title, value: id });
	}
	await interaction.respond(data);
}
