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
			if (interaction.replied || interaction.deferred) {
				await interaction
					.followUp({
						embeds: [embedCommandNotFound],
						ephemeral: true,
					})
					.catch(console.error);
			} else {
				await interaction
					.reply({
						embeds: [embedCommandNotFound],
						ephemeral: true,
					})
					.catch(console.error);
			}
		} else {
			await command.run(client, interaction);
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
	if (interaction.isMessageComponent()) {
		try {
			const [componentId, ...args] = interaction.customId.split("-");

			const component = client.components.get(componentId);
			console.log("Component:", componentId);
			console.log("Args:", args);

			if (!component) {
				if (interaction.replied || interaction.deferred) {
					await interaction
						.followUp({
							content: "Component not found",
							ephemeral: true,
						})
						.catch(console.error);
				} else {
					await interaction
						.reply({
							content: "Component not found",
							ephemeral: true,
						})
						.catch(console.error);
				}

				return;
			}

			await component.run(client, interaction, args);
		} catch (error) {
			console.error(error);
			await client.errorHandling.handleComponentError(
				client,
				error as Error,
				interaction,
			);
		}
	}
}
