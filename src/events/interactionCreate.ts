import type { Interaction } from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";
import type { Command } from "#types";
import { handleError } from "#utils";
export async function interactionCreate(
	client: SkyndalexClient,
	interaction: Interaction<"cached">,
) {
	if (interaction.isChatInputCommand()) {
		const embedCommandNotFound = new EmbedBuilder(
			client,
			interaction.locale,
		)
			.setDescription("COMMAND_FAILED", {
				lng: interaction.locale,
				commandName: interaction.commandName,
			})
			.setFooter({
				text: "SUPPORT_INVITE_FOOTER",
				iconURL: client.user.displayAvatarURL(),
			})
			.setColor("Red");

		const subcommand = interaction.options.getSubcommand(false);
		let command: Command | undefined;
		if (subcommand) {
			command = client.commands.get(
				`${interaction.commandName}/${subcommand}`,
			);
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

	if (interaction.isMessageComponent()) {
		const embedComponentNotFound = new EmbedBuilder(
			client,
			interaction.locale,
		)
			.setDescription("COMPONENT_FAILED", {
				lng: interaction.locale,
				componentId: interaction.customId,
				support: client.support,
			})
			.setFooter({
				text: "SUPPORT_INVITE_FOOTER",
				iconURL: client.user.displayAvatarURL(),
			})
			.setColor("Red");

		const component = client.components.get(
			interaction.customId.split("-")[0],
		);
		if (!component) {
			await handleError(
				client,
				new Error("Component not found"),
				interaction,
			);

			await interaction.reply({
				embeds: [embedComponentNotFound],
				ephemeral: true,
			});
		}

		try {
			await component.run(client, interaction);
		} catch (e) {
			console.error(e);
			const embedError = new EmbedBuilder(client, interaction.locale)
				.setDescription("COMPONENT_FAILED", {
					lng: interaction.locale,
					componentId: interaction.customId,
				})
				.setColor("Red");
			await interaction.reply({
				embeds: [embedError],
				ephemeral: true,
			});
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

	if (interaction.isModalSubmit()) {
		const embedModalNotFound = new EmbedBuilder(client, interaction.locale)
			.setDescription("MODAL_FAILED", {
				lng: interaction.locale,
				modalId: interaction.customId,
				support: client.support,
			})
			.setFooter({
				text: "SUPPORT_INVITE_FOOTER",
				iconURL: client.user.displayAvatarURL(),
			})
			.setColor("Red");
		const modal = client.modals.get(interaction.customId.split("-")[0]);
		if (!modal) {
			await handleError(
				client,
				new Error("Modal not found"),
				interaction,
			);

			return interaction.reply({
				embeds: [embedModalNotFound],
				ephemeral: true,
			});
		}

		try {
			await modal.run(client, interaction);
		} catch (e) {
			console.error(e);
			await handleError(client, e, interaction);
			const embedError = new EmbedBuilder(client, interaction.locale)
				.setDescription("MODAL_FAILED", {
					lng: interaction.locale,
					modalId: interaction.customId,
					support: client.support,
				})
				.setFooter({
					text: "SUPPORT_INVITE_FOOTER",
					iconURL: client.user.displayAvatarURL(),
				})
				.setColor("Red");
			await interaction.reply({
				embeds: [embedError],
				ephemeral: true,
			});
		}
	}
}
