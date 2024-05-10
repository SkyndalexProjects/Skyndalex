import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../../classes/Client";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	return interaction.reply("custom test");
}
export const data = new SlashCommandBuilder()
	.setName("advancement")
	.setDescription("Generate advancement");
