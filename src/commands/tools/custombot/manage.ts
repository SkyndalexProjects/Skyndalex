import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../../classes/Client";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	return interaction.reply("manage");
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("manage")
	.setDescription("Manage your custom bot");
