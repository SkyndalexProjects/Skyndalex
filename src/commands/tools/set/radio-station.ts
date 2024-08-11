import {
	type AutocompleteInteraction,
	ChannelType,
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { radioStationData, radioStationSearchQueryResult } from "#types";
import type { SkyndalexClient } from "#classes";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const id = interaction.options.getString("station");
	const channel = interaction.options.getChannel("channel");

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

	if (client.user.id !== process.env.CLIENT_ID) {
		await client.prisma.customBotSettings.upsert({
			where: {
				clientId: client.user.id,
				userId: interaction.user.id,
				guildId: interaction.guild.id,
			},
			create: {
				clientId: client.user.id,
				userId: interaction.user.id,
				guildId: interaction.guild.id,
				radioStation: id,
			},
			update: {
				radioStation: id,
			},
		});
	} else {
		await client.prisma.settings.upsert({
			where: {
				guildId: interaction.guild.id,
			},
			create: {
				guildId: interaction.guild.id,
				radioStation: id,
			},
			update: {
				radioStation: id,
			},
		});
	}

	await interaction.reply({
		content: `📻 | Radio station set to ${json.data.title} [${json.data.id}]`,
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("radio-station")
	.setDescription("Set custom radio station")
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
