import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const chatBotTemperature = interaction.options.getInteger("temperature");
	const chatBotMaxTokens = interaction.options.getInteger("max-tokens");
	const chatBotSystemPrompt = interaction.options.getString("system-prompt");

	await client.prisma.settings.upsert({
		where: {
			guildId: interaction.guild.id,
		},
		create: {
			guildId: interaction.guild.id,
			chatBotTemperature,
			chatBotMaxTokens,
			chatBotSystemPrompt,
		},
		update: {
			chatBotTemperature,
			chatBotMaxTokens,
			chatBotSystemPrompt,
		},
	});

	return interaction.reply({
		content: client.i18n.t("CHATBOT_CONFIG_SET", {
			chatBotSystemPrompt,
			chatBotTemperature,
			chatBotMaxTokens,
			lng: interaction.locale,
		}),
		ephemeral: true,
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("chatbot-config")
	.setDescription("Set your AI chatbot on your server.")
	.addStringOption((option) =>
		option
			.setName("system-prompt")
			.setDescription("Your system prompt for AI chatbot")
			.setMaxLength(1000)
			.setRequired(true),
	)
	.addIntegerOption((option) =>
		option
			.setName("temperature")
			.setDescription("Temperature for AI chatbot")
			.setMaxValue(2)
			.setMinValue(1)
			.setRequired(true),
	)
	.addIntegerOption((option) =>
		option
			.setName("max-tokens")
			.setDescription("Max tokens for AI chatbot")
			.setRequired(true)
			.setMaxValue(2048)
			.setMinValue(1),
	);
