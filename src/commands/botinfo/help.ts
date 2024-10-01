import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const commands = await client.application.commands.fetch();
	const clientCommands = client.commands;

	const joinedMap = clientCommands.reduce((acc, cmd) => {
		const command = commands.find((c) => c.name === cmd.data.name);
		if (command) {
			const categoryName =
				cmd.category.charAt(0).toUpperCase() + cmd.category.slice(1);
			const existing = acc.find((item) => item.name === categoryName);
			const value = `</${cmd.data.name}:${command.id}>`;

			if (existing) {
				existing.value += `, ${value}`;
			} else {
				acc.push({ name: categoryName, value });
			}
		}
		return acc;
	}, []);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("Help")
		.setColor("Green")
		.addFields(joinedMap);

	return interaction.reply({ embeds: [embed] });
}

export const data = {
	...new SlashCommandBuilder()
		.setName("help")
		.setDescription("help")
		.setIntegrationTypes([0, 1])
		.setContexts([0, 1, 2]),
};
