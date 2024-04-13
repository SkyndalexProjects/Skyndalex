import type { SkyndalexClient } from "../classes/Client";
import type { Interaction } from 'discord.js';
import { InteractionType } from 'discord.js';

export async function interactionCreate(client: SkyndalexClient, interaction: Interaction) {
    console.log("interaction", interaction)
    switch (interaction.type) {
        case InteractionType.ApplicationCommand: {
            const command = client.commands.get(interaction.commandName);
            console.log("command", command)
            await command.run(client, interaction)
            break;
        }
    }
}