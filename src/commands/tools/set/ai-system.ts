import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	await client.prisma.settings.upsert({
		where: {
			guildId: interaction.guild.id,
		},
		create: {
			guildId: interaction.guild.id,
			chatBotTemperature: interaction.options.getInteger("temperature"),
			chatBotMaxTokens: interaction.options.getInteger("max-tokens"),
			chatBotSystemPrompt: interaction.options.getString("system-prompt"),
		},
		update: {
			chatBotTemperature: interaction.options.getInteger("temperature"),
			chatBotMaxTokens: interaction.options.getInteger("max-tokens"),
			chatBotSystemPrompt: interaction.options.getString("system-prompt"),
		},
	});

	return interaction.reply({
		content: `<:checkpassed:1071529475541565620> | AI chatbot system prompt set to *${interaction.options.getString(
			"system-prompt",
		)}*\n\n**with temperature ${interaction.options.getInteger(
			"temperature",
		)} and max tokens ${interaction.options.getInteger("max-tokens")}.**`,
		ephemeral: true,
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("ai-system")
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
