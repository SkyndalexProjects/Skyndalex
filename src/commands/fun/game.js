import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Gamedig from "gamedig";

export async function run(client, interaction) {
	const data = await Gamedig.query({
		type: interaction.options.getString("game"),
		host: interaction.options.getString("server"),
	});

	// console.log("data", data)

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
			{ name: "Ping", value: `${data.raw.vanilla.ping}`, inline: true },
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
}
export const data = new SlashCommandBuilder()
	.setName("game")
	.setDescription("Search game server")
	.addStringOption((option) =>
		option.setName("game").setDescription("Game name").setRequired(true),
	)
	.addStringOption((option) =>
		option.setName("server").setDescription("Server IP").setRequired(true),
	);
