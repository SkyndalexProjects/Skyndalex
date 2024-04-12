import type { SkyndalexClient } from "../classes/Client";
import type { Interaction } from 'discord.js';
import { Routes } from "discord.js";

export async function ready(client: SkyndalexClient, interaction: Interaction) {
    console.log("dupa")
    console.log("commands", client.commands)

    await client.rest.put(
        Routes.applicationCommands(client.user.id),
        { body:  client.commands },
    );
}