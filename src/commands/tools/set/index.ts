import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	PermissionFlagsBits,
} from "discord.js";
import type { SkyndalexClient } from "../../../classes/Client";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	return interaction.reply("config test");
}
export const data = new SlashCommandBuilder()
	.setName("set")
	.setDescription("Guild configuration")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
