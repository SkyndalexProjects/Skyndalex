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
	const station = interaction.options.getString("station");
	const memberChannel = interaction.member.voice.channel;

	if (!memberChannel) {
		return await interaction.reply({
			content:
				"❌ | You need to be in a voice channel to play a radio station!",
			ephemeral: true,
		});
	}

	const url = `https://radio.garden/api/ara/content/channel/${station}`;
	const resourceUrl = `https://radio.garden/api/ara/content/listen/${station}/channel.mp3`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			accept: "application/json",
		},
	});
	const json = (await response.json()) as radioStationData;
	if (json.error)
		return interaction.reply({
			content: "❌ | Radio station not found!",
			ephemeral: true,
		});

	// TODO: make RADIO_PLAYING_CHANGED, RADIO_PLAYING_DESC_CHANGED

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("RADIO_PLAYING")
		.setDescription("RADIO_PLAYING_DESC", {
			radioStation: json.data.title,
			radioCountry: json.data.country.title,
			radioPlace: json.data.place.title,
		})
		.setColor("Green");

	if (client.shoukaku.players.size < 1) {
		const player = await client.shoukaku.joinVoiceChannel({
			guildId: interaction.guild.id,
			channelId: memberChannel.id,
			shardId: 0,
		});

		const result = await player.node.rest.resolve(resourceUrl);
		await player.playTrack({ track: result.data.encoded });

		return interaction.reply({ embeds: [embed] });
	} else {
		const player = client.shoukaku.players.get(interaction.guild.id);
		const result = await player.node.rest.resolve(resourceUrl);
		await player.playTrack({ track: result.data.encoded });

		return interaction.reply({ embeds: [embed] });
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
