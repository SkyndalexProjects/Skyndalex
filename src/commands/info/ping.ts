import type { SkyndalexClient } from "../../classes/Client";
import { type ChatInputCommandInteraction, SlashCommandBuilder} from 'discord.js';

export async function run(client: SkyndalexClient, interaction: ChatInputCommandInteraction) {
    await interaction.reply(`Ping: \`\`\`yaml\n${client.ws.ping}ms\`\`\``)
}
export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!");