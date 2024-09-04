import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#classes/builders";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const categories = client.commands
		.map((c) => c.category)
		.filter((v, i, a) => a.indexOf(v) === i);

	const fields = categories.map((category) => ({
		name: category.charAt(0).toUpperCase() + category.slice(1),
		value: client.commands
			.filter((c) => c.category === category)
			.map((c) => `</${c.data.name}:0>`)
			.join(", "),
	}));

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("Help")
		.setDescription("This is the help command")
		.setColor("Green")
		.addFields(fields);

	if (!interaction.guild) {
		const embed = new EmbedBuilder(client, interaction.locale)
			.setTitle("Help")
			.setDescription("Help for userapps")
			.setColor("Green")
			.addFields([
				{
					name: "Userapps",
					value: client.commands
						.filter((c) => c.data.integration_types)
						.map((c) => `</${c.data.name}:0>`)
						.join(", "),
				},
			]);
		return interaction.reply({ embeds: [embed] });
	}

	return interaction.reply({ embeds: [embed] });
}

export const data = {
	...new SlashCommandBuilder().setName("help").setDescription("help")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2])
};
