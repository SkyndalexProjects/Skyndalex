import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

export async function run(client, interaction) {
	const response = await fetch(
		"https://api.thedogapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=1",
		{
			headers: {
				"Content-Type": "application/json",
				"x-api-key": process.env.THEDOGAPI_KEY,
			},
		},
	);
	const json = await response.json();

	console.log("json", json[0].url);
	const embed = new EmbedBuilder()
		.setImage(json[0].url)
		.setFooter({ text: "Powered by thedogapi.com" });

	await interaction.reply({ embeds: [embed] });
}
export const data = {
	...new SlashCommandBuilder()
		.setName("dog")
		.setDescription("Dog image"),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
}