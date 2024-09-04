import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await interaction.reply(`Ping: \`\`\`yaml\n${client.ws.ping}ms\`\`\``);
}
export const data = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("Replies with Pong!")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
