import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	await client.radio.stopRadio(client, interaction.guild.id);
}

export const data = new SlashCommandBuilder()
	.setName("leave")
	.setDescription("Leave voice channel");
