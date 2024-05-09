import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	type AutocompleteInteraction,
	ChannelType,
} from "discord.js";
import type { radioStation } from "../../../../types/structures";
import type { SkyndalexClient } from "../../../../classes/Client";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	return interaction.reply("radio station test");
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("station")
	.setDescription("Station value")
	.addStringOption((option) =>
		option
			.setName("station")
			.setDescription("Station value")
			.setAutocomplete(true)
			.setRequired(true),
	)
	.addChannelOption((option) =>
		option
			.setName("channel")
			.setDescription(
				"Channel to play the radio in after user joins a voice channel",
			)
			.addChannelTypes(ChannelType.GuildVoice)
			.setRequired(true),
	);

export async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedValue = interaction.options.getFocused(true).value;
	console.log("focuesd value", focusedValue);
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
