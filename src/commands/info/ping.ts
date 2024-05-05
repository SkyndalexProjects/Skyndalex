import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	console.log("This is a ping")
	await interaction.reply(`Ping: \`\`\`yaml\n${client.ws.ping}ms\`\`\``);
}
export const data = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("Replies with Pong!");
