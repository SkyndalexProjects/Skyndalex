import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const apiKey = interaction.options.getString("api-key");
	const service = interaction.options.getString("service");

	await client.prisma.settings.upsert({
		where: {
			guildId: interaction.guildId,
		},
		update: {
			chatbotAPIKey: apiKey,
		},
		create: {
			guildId: interaction.guildId,
			chatbotAPIKey: apiKey,
		},
	});

	await interaction.reply({
		content: `<:checkpassed:1071529475541565620> | Key activated on this server using ${service} service.`,
		ephemeral: true,
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("ai-key")
	.setDescription(
		"Activate AI on your server/account by providing API key from specific service.",
	)
	.addStringOption((option) =>
		option
			.setName("api-key")
			.setDescription("API key or token to activate AI chatbot")
			.setRequired(true),
	)