import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	type AutocompleteInteraction,
	ChannelType,
} from "discord.js";
import type { radioStation } from "../../../../types/structures";
import type { SkyndalexClient } from "../../../../classes/Client";
import type { radioStationData } from "../../../../types/structures";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const id = interaction.options.getString("station");
	const channel = interaction.options.getChannel("channel")
	console.log("id", id, "channel", channel);

	const url = `https://radio.garden/api/ara/content/channel/${id}`;
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
		});

		
	await client.prisma.settings.upsert({
		where: {
			guildId: interaction.guild.id,
		},
		create: {
			guildId: interaction.guild.id,
			radioStation: id,
			autoRadioChannel: channel.id,
		},
		update: {
			radioStation: id,
			autoRadioChannel: channel.id,
		},
	});

	await interaction.reply({
		content: `📻 | Radio station set to ${json.data.title} (channel: \`${channel.name}\`)`,
	});
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
