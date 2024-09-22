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
		content: client.i18n.t("CHATBOT_ACTIVATED", {
			lng: interaction.locale,
		}),
		ephemeral: true,
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("chatbot-key")
	.setDescription("Activate AI on your guild by providing API key.")
	.addStringOption((option) =>
		option
			.setName("api-key")
			.setDescription("API key or token to activate AI chatbot")
			.setRequired(true),
	);
