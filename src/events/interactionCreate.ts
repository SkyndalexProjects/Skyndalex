import { EmbedBuilder, type Interaction } from "discord.js";
import { InteractionType } from "discord.js";
import type { SkyndalexClient } from "../classes/Client";

export async function interactionCreate(
	client: SkyndalexClient,
	interaction: Interaction,
) {
	switch (interaction.type) {
		case InteractionType.ApplicationCommand: {
			const embedCommandNotFound = new EmbedBuilder()
				.setDescription(
					client.i18n.t("COMMAND_FAILED", {
						lng: interaction.locale,
						commandName: interaction.commandName,
					}),
				)
				.setColor("Red");

			// TODO: add typing
			const subcommand = interaction.options.getSubcommand(false);
			const subcommandGroup =
				interaction.options.getSubcommandGroup(false);

			const command = client.commands.get(
				subcommandGroup
					? `${interaction.commandName}/${subcommandGroup}/${subcommand}`
					: subcommand
						? `${interaction.commandName}/${subcommand}`
						: interaction.commandName,
			);
			if (!command)
				return interaction.reply({
					embeds: [embedCommandNotFound],
					ephemeral: true,
				});

			try {
				await command.run(client, interaction);
			} catch (e) {
				console.error(e);
				const embedError = new EmbedBuilder()
					.setDescription(
						client.i18n.t("COMMAND_FAILED", {
							lng: interaction.locale,
							commandName: interaction.commandName,
						}),
					)
					.setColor("Red");
				await interaction.reply({
					embeds: [embedError],
					ephemeral: true,
				});
			}
			break;
		}
		case InteractionType.MessageComponent: {
			const embedComponentNotFound = new EmbedBuilder()
				.setDescription(
					client.i18n.t("COMPONENT_FAILED", {
						lng: interaction.locale,
						componentId: interaction.customId,
					}),
				)
				.setColor("Red");

			const component = client.components.get(interaction.customId);
			if (!component)
				return interaction.reply({
					embeds: [embedComponentNotFound],
					ephemeral: true,
				});

			try {
				await component.run(client, interaction);
			} catch (e) {
				console.error(e);
				const embedError = new EmbedBuilder()
					.setDescription(
						client.i18n.t("COMPONENT_FAILED", {
							lng: interaction.locale,
						}),
					)
					.setColor("Red");
				await interaction.reply({
					embeds: [embedError],
					ephemeral: true,
				});
			}
			break;
		}
		case InteractionType.ApplicationCommandAutocomplete:
			if (interaction.isAutocomplete()) {
				const subcommand = interaction.options.getSubcommand(false);
				const subcommandGroup =
					interaction.options.getSubcommandGroup(false);

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
			break;
	}
}
