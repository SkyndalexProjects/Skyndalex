import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

const successChance = 0.5;

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await client.economy.resolveGambleAction(interaction, "crime", successChance);
}

export const data = new SlashCommandBuilder()
	.setName("crime")
	.setDescription("Crime");
