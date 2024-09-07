import type { SkyndalexClient } from "classes/Client.js";
import {
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { GameDig, games } from "gamedig";
import { EmbedBuilder } from "#builders";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	try {
		await interaction.deferReply();
		const game = interaction.options.getString("game");
		const [server, port] = interaction.options
			.getString("server")
			.split(":");

		const data = await GameDig.query({
			type: game,
			host: server,
			port: Number(port),
		});

		if (!data)
			return interaction.editReply({
				content: client.i18n.t("GAME_SERVER_NOT_FOUND", {
					lng: interaction.locale,
				}),
			});
		const embed = new EmbedBuilder(client, interaction.locale)
			.setTitle(String(data.name))
			.setColor("Green")
			.addFields([
				{
					name: "IP_ADDRESS",
					value: data.connect.toString().split(":")[0],
					inline: true,
				},
				{
					name: "PLAYERS_COUNT",
					value: `${data.numplayers}/${data.maxplayers}`,
					inline: true,
				},
				{
					name: "GAME_MAP",
					value: data.map.toString() || "None",
					inline: true,
				},
				{ name: "GAME_PING", value: String(data.ping), inline: true },
				{
					name: "GAME_VERSION",
					value: String(data.version) || "None",
					inline: true,
				},
				{
					name: "PLAYERS_LIST",
					value: data.players.map((p) => p.name).join(", ") || "None",
				},
			]);
		return interaction.editReply({ embeds: [embed] });
	} catch (e) {
		console.error(e);

		return interaction.editReply({
			content: client.i18n.t("GAME_SERVER_FAILED", {
				lng: interaction.locale,
				server: interaction.options.getString("server"),
				game: interaction.options.getString("game"),
			}),
		});
	}
}

export const data = {
	...new SlashCommandBuilder()
		.setName("game")
		.setDescription("Check status of your favourtie server in game!")
		.addStringOption((option) =>
			option
				.setName("game")
				.setDescription("Game")
				.setAutocomplete(true)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option.setName("server").setDescription("Server").setRequired(true),
		)
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
};

export async function autocomplete(interaction: AutocompleteInteraction) {
	const focusedValue = interaction.options.getFocused();
	const filteredGames = Object.keys(games).filter((game) =>
		game.startsWith(focusedValue),
	);
	const data = filteredGames
		.slice(0, 25)
		.map((choice) => ({ name: choice, value: choice }));
	await interaction.respond(data);
}
