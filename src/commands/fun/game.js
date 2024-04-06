import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Gamedig from "gamedig";

export async function run(client, interaction) {
	try {
		const data = await Gamedig.query({
			type: interaction.options.getString("game"),
			host: interaction.options.getString("server"),
		});
		const embed = new EmbedBuilder()
			.setTitle(
				`${data.name} : \`${data.raw.vanilla.connect}\` | Ping: ${data.raw.vanilla.ping}ms`,
			)
			.addFields(
				{
					name: "Map",
					value: `${data.raw.vanilla.map || "None"}`,
					inline: true,
				},
				{
					name: "Ping",
					value: `${data.raw.vanilla.ping}`,
					inline: true,
				},
				{
					name: "Password protected?",
					value: `${data.raw.vanilla.password}`,
					inline: true,
				},
			)
			.setColor("Blurple");

		if (data.players.length > 0) {
			embed.addFields({
				name: "Players",
				value: `${data.players.length}/${data.maxplayers}`,
				inline: true,
			});
		}

		await interaction.reply({ embeds: [embed] });
	} catch (e) {
		// TODO: make autocomplete
		const embedNoData = new EmbedBuilder()
			.setDescription(
				`No data found. Check the server IP or game name\n[View games list](https://github.com/gamedig/node-gamedig/blob/HEAD/GAMES_LIST.md)`,
			)
			.setFooter({ text: `${e}` });
		return interaction.reply({ embeds: [embedNoData], ephemeral: true });
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
				.setRequired(true),
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
