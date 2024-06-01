import { EmbedBuilder, type Interaction } from "discord.js";
import { InteractionType } from "discord.js";
import type { SkyndalexClient } from "../classes/Client.js";

export async function interactionCreate(
	client: SkyndalexClient,
	interaction: Interaction<"cached">,
) {
	if(interaction.isChatInputCommand()) {
				const embedCommandNotFound = new EmbedBuilder()
					.setDescription(
						client.i18n.t("COMMAND_FAILED", {
							lng: interaction.locale,
							commandName: interaction.commandName,
						}),
					)
					.setColor("Red");

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
					await interaction.reply({
						embeds: [embedCommandNotFound],
						ephemeral: true,
					});
					console.error(e);
				}
	}

	if(interaction.isMessageComponent()) {
				console.log("działam");
				const embedComponentNotFound = new EmbedBuilder()
					.setDescription(
						client.i18n.t("COMPONENT_FAILED", {
							lng: interaction.locale,
							componentId: interaction.customId,
						}),
					)
					.setColor("Red");

				const component = client.components.get(
					interaction.customId.split("-")[0],
				);
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
	}

	if(interaction.isAutocomplete()) {
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

	if(interaction.isModalSubmit()) {
				const embedModalNotFound = new EmbedBuilder()
					.setDescription(
						client.i18n.t("MODAL_FAILED", {
							lng: interaction.locale,
							modalId: interaction.customId,
						}),
					)
					.setColor("Red");

				const modal = client.modals.get(interaction.customId.split("-")[0]);
				if (!modal)
					return interaction.reply({
						embeds: [embedModalNotFound],
						ephemeral: true,
					});

				try {
					await modal.run(client, interaction);
				} catch (e) {
					console.error(e);
					const embedError = new EmbedBuilder()
						.setDescription(
							client.i18n.t("MODAL_FAILED", {
								lng: interaction.locale,
							}),
						)
						.setColor("Red");
					await interaction.reply({
						embeds: [embedError],
						ephemeral: true,
					});
				}
	}
}
