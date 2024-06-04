import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client.js";
import { EmbedBuilder } from "#builders";
import type { weatherData } from "../../types/structures";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	try {
		const city = interaction.options.getString("city");
		const weather = await fetch(`https://wttr.in/${city}?format=j1`);
		console.log("weather", weather);
		const data = (await weather.json()) as weatherData;

		await interaction.deferReply();

		const embed = new EmbedBuilder(client, interaction.locale)
			.setTitle("WEATHER_TITLE", {
				city: city,
			})
			.addFields([
				{
					name: "WEATHER_TEMPERATURE",
					value: `${data.current_condition[0].temp_C}°C`,
					inline: true,
				},
				{
					name: "WEATHER_FEELS_LIKE",
					value: `${data.current_condition[0].FeelsLikeC}°C`,
					inline: true,
				},
				{
					name: "WEATHER_HUMIDITY",
					value: `${data.current_condition[0].humidity}%`,
					inline: true,
				},
				{
					name: "WEATHER_WIND_SPEED",
					value: `${data.current_condition[0].windspeedKmph} km/h`,
					inline: true,
				},
			]);

		return interaction.editReply({ embeds: [embed] });
	} catch (e) {
		const embedCommandNotFound = new EmbedBuilder(
			client,
			interaction.locale,
		)
			.setDescription("COMMAND_FAILED")
			.setColor("Red");

		await interaction.editReply({ embeds: [embedCommandNotFound] });
		console.error(e);
	}
}
export const data = new SlashCommandBuilder()
	.setName("weather")
	.setDescription("Check weather")
	.addStringOption((option) =>
		option
			.setName("city")
			.setDescription("City to check weather for")
			.setRequired(true),
	);
