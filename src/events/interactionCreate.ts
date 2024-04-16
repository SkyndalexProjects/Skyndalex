import type { Interaction } from "discord.js";
import { InteractionType } from "discord.js";
import type { SkyndalexClient } from "../classes/Client";

export async function interactionCreate(
	client: SkyndalexClient,
	interaction: Interaction,
) {
	switch (interaction.type) {
		case InteractionType.ApplicationCommand: {
			const command = client.commands.get(interaction.commandName);
			await command.run(client, interaction);
			break;
		}
		case InteractionType.MessageComponent: {
			const component = client.components.get(interaction.customId);
			await component.run(client, interaction);
			break;
		}
	}
}
