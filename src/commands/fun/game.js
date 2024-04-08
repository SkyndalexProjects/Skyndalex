import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { GameDig, games } from "gamedig";
import fetch from "node-fetch";
export async function run(client, interaction) {
	try {
		const data = await GameDig.query({
			type: interaction.options.getString("game"),
			host: interaction.options.getString("server"),
		});
		if (!data) return interaction.reply("Server not found.");
		let embed = new EmbedBuilder()
			.setTitle(
				`${data.name} : \`${data.raw.vanilla.connect}\` | Ping: ${data.raw.vanilla.ping}ms`,
			)
			.addFields(
				{
					name: "Map",
					value: `${data.map || "None"}`,
				},
				{
					name: "Ping",
					value: `${data.ping}`,
				},
				{
					name: "Password protected?",
					value: `${data.raw.vanilla.password}`,
				},
				{
					name: "Players",
					value: `${data.numplayers}/${data.maxplayers}`,
				}
			)
			.setColor("Green");

		await interaction.reply({ embeds: [embed] });
	} catch(e) {
		return interaction.reply({ content: `**${interaction.options.getString("game")}** server not found, or another error. \`(${interaction.options.getString("server")}\`)`, ephemeral: true });
	}
}
export const data = {
	...new SlashCommandBuilder()
		.setName("game")
		.setDescription("Search game server")
		.addStringOption((option) =>
			option
				.setName("game")
				.setDescription("Game name")
				.setRequired(true)
				.setAutocomplete(true)
		)
		.addStringOption((option) =>
			option
				.setName("server")
				.setDescription("Server IP")
				.setRequired(true),
		),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
export async function autocomplete(interaction) {
	const focusedValue = interaction.options.getFocused();
	const filteredGames = Object.keys(games).filter((game) => game.startsWith(focusedValue));
	const data = filteredGames.slice(0, 25).map((choice) => ({ name: choice, value: choice }));
	await interaction.respond(data);
}
