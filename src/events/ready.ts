import type { SkyndalexClient } from "../classes/Client";
import type { Interaction } from 'discord.js';
import { Routes } from "discord.js";

export async function ready(client: SkyndalexClient, interaction: Interaction) {
    const parsedCommands = client.commands.map(command => command.data.toJSON());
    const data = await client.rest.put(
        Routes.applicationCommands(client.user.id),
        { body: parsedCommands },
    );
}