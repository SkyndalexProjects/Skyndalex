import type { SkyndalexClient } from "classes/Client";
import { EmbedBuilder } from "classes/builders/EmbedBuilder";
import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { GameDig, games } from "gamedig";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	try {
		const game = interaction.options.getString("game");
		const server = interaction.options.getString("server");

		const data = await GameDig.query({
			type: game,
			host: server,
		});
		if (!data)
			return interaction.reply(
				client.i18n.t("GAME_SERVER_NOT_FOUND", {
					lng: interaction.locale,
				}),
			);
		const embed = new EmbedBuilder(client, interaction.locale)
			.setTitle(String(data.name))
			.setColor("Green")
			.setFields([
				{ name: "IP", value: String(data.connect), inline: true },
				{
					name: "Players",
					value: `${data.numplayers}/${data.maxplayers}`,
					inline: true,
				},
				{
					name: "Map",
					value: String(data.map) || "None",
					inline: true,
				},
				{ name: "Ping", value: String(data.ping), inline: true },
			]);
		return interaction.reply({ embeds: [embed] });
	} catch (e) {
		return interaction.reply(
			client.i18n.t("GAME_SERVER_FAILED", { lng: interaction.locale }),
		);
	}
}

export const data = new SlashCommandBuilder()
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
	);

export async function autocomplete(interaction) {
	const focusedValue = interaction.options.getFocused();
	const filteredGames = Object.keys(games).filter((game) =>
		game.startsWith(focusedValue),
	);
	const data = filteredGames
		.slice(0, 25)
		.map((choice) => ({ name: choice, value: choice }));
	await interaction.respond(data);
}
