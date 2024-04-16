import { EmbedBuilder, type Interaction } from "discord.js";
import { InteractionType } from "discord.js";
import type { SkyndalexClient } from "../classes/Client";

export async function interactionCreate(
	client: SkyndalexClient,
	interaction: Interaction,
) {
	const embedCommandNotFound = new EmbedBuilder()
		.setDescription(
			client.i18n.t("WRONG_COMMAND_ERROR", {
				lng: interaction.locale,
				commandName: interaction.commandName,
			}),
		)
		.setColor("Red");

	const embedComponentNotFound = new EmbedBuilder()
		.setDescription(
			client.i18n.t("WRONG_COMPONENT_ERROR", {
				lng: interaction.locale,
				componentId: interaction.customId,
			}),
		)
		.setColor("Red");

	switch (interaction.type) {
		case InteractionType.ApplicationCommand: {
			const command = client.commands.get(interaction.commandName);
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
						client.i18n.t("COMMAND_INTERACTION_ERROR", {
							lng: interaction.locale,
						}),
					)
					.setColor("Red");
				interaction.reply({ embeds: [embedError], ephemeral: true });
			}
			break;
		}
		case InteractionType.MessageComponent: {
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
						client.i18n.t("COMPONENT_INTERACTION_ERROR", {
							lng: interaction.locale,
						}),
					)
					.setColor("Red");
				interaction.reply({ embeds: [embedError], ephemeral: true });
			}
			break;
		}
	}
}
