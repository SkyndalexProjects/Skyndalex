import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../../classes/Client";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	return interaction.reply("generate img test");
}
export const data = new SlashCommandBuilder()
	.setName("gen")
	.setDescription("Generate content with AI");
