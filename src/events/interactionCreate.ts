import type { Interaction } from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import type { Command } from "#types";
export async function interactionCreate(
	client: SkyndalexClient,
	interaction: Interaction<"cached">,
) {
	if (interaction.isChatInputCommand()) {
		const embedCommandNotFound = new EmbedBuilder(client, interaction.locale)
			.setDescription("COMMAND_FAILED", {
				lng: interaction.locale,
				commandName: interaction.commandName,
			})
			.setFooter({
				text: "SUPPORT_INVITE_FOOTER",
				iconURL: client.user?.displayAvatarURL(),
			})
			.setColor("Red");

		const subcommand = interaction.options.getSubcommand(false);
		let command: Command | undefined;
		if (subcommand) {
			command = client.commands.get(`${interaction.commandName}/${subcommand}`);
		} else {
			command = client.commands.get(interaction.commandName);
		}

		if (!command) {
			await interaction
				.reply({
					embeds: [embedCommandNotFound],
					ephemeral: true,
				})
				.catch(console.error);
		} else {
			try {
				await command.run(client, interaction);
			} catch (e) {
				await interaction
					.reply({
						embeds: [embedCommandNotFound],
						ephemeral: true,
					})
					.catch(console.error);
				console.error(e);
			}
		}
	}

	if (interaction.isAutocomplete()) {
		const subcommand = interaction.options.getSubcommand(false);
		const subcommandGroup = interaction.options.getSubcommandGroup(false);

		const command = client.commands.get(
			subcommandGroup
				? `${interaction.commandName}/${subcommandGroup}/${subcommand}`
				: subcommand
					? `${interaction.commandName}/${subcommand}`
					: interaction.commandName,
		);
		if (!command) return;

		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
		}
	}
}
