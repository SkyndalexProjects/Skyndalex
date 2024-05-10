import {
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
} from "@discordjs/voice";
import {
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { fetch } from "undici";
import type { SkyndalexClient } from "../../classes/Client";
import { EmbedBuilder } from "../../classes/builders/EmbedBuilder";
import type { radioStation, radioStationData } from "../../types/structures";

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
				ephemeral: true,
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

		// console.log("json", json);
		if (json.error)
			return interaction.editReply({
				content: client.i18n.t("RADIO_STATION_NOT_FOUND", {
					lng: interaction.locale,
				}),
			});

		const id = json.data.url.split("/")[3];
		const resourceUrl = `https://radio.garden/api/ara/content/listen/${id}/channel.mp3`;

		const connection = joinVoiceChannel({
			channelId: memberChannel.id,
			guildId: memberChannel.guild.id,
			adapterCreator: memberChannel.guild.voiceAdapterCreator,
		});

		const player = createAudioPlayer();
		connection.subscribe(player);

		const stream = await fetch(resourceUrl).then((res) => res.body);
		const resource = createAudioResource(stream, { seek: 0, volume: 1 });
		player.play(resource);

		player.on("stateChange", (oldState, newState) => {
			const state = newState.status;
			const currentState = {
				idle: `🟡 ${client.i18n.t("RADIO_STATE_IDLE", {
					lng: interaction.locale,
				})}`,
				stopped: `🔴 ${client.i18n.t("RADIO_STATE_STOPPED", {
					lng: interaction.locale,
				})}`,
				playing: `🟢 ${client.i18n.t("RADIO_STATE_PLAYING", {
					lng: interaction.locale,
				})}`,
				paused: `🔵 ${client.i18n.t("RADIO_STATE_PAUSED", {
					lng: interaction.locale,
				})}`,
				autopaused: `🟣 ${client.i18n.t("RADIO_STATE_AUTOPAUSED", {
					lng: interaction.locale,
				})}`,
			};

			const embed = new EmbedBuilder(client, interaction.locale)
				.setTitle("RADIO_STATE_PLAYING")
				.setDescription("RADIO_PLAYING_DESC", {
					radioState: currentState[state] || state,
					radioStation: json.data.title,
					radioCountry: json.data.country.title,
					radioPlace: json.data.place.title,
				})
				.setFooter({
					text: "RADIO_PLAYING_FOOTER",
					textArgs: { radioWebsite: json.data.website },
				})
				.setColor("Green");

			interaction.editReply({ embeds: [embed] });
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

	const jsonResponse = (await response.json()) as radioStation;

	const data = [];

	for (const radioStation of jsonResponse.hits.hits) {
		if (radioStation._source.type !== "channel") continue;

		const id = radioStation._source.url.split("/")[3];
		data.push({ name: radioStation._source.title, value: id });
	}
	await interaction.respond(data);
}
