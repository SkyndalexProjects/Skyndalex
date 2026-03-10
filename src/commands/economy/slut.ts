import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

const successChance = 0.6;

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await client.economy.resolveGambleAction(interaction, "slut", successChance);
}

export const data = new SlashCommandBuilder()
	.setName("slut")
	.setDescription("Slut");
