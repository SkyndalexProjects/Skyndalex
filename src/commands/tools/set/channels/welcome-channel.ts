import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../../../classes/Client";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	return interaction.reply("welcome channel test");
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("welcome-channel")
	.setDescription("Set welcome channel");
