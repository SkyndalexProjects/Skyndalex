import type { SkyndalexClient } from "../classes/Client";
import type { Interaction } from 'discord.js';
import { InteractionType } from 'discord.js';

export async function interactionCreate(client: SkyndalexClient, interaction: Interaction) {
    switch (interaction.type) {
        case InteractionType.ApplicationCommand: {
            const command = client.commands.get(interaction.commandName);
            console.log("command", command)
            break;
        }
    }
}