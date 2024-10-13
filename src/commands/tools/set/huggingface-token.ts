import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const huggingFaceToken = interaction.options.getString("huggingface-token");

	await client.prisma.settings.upsert({
		where: {
			guildId: interaction.guildId,
		},
		update: {
			huggingFaceToken,
		},
		create: {
			guildId: interaction.guildId,
			huggingFaceToken,
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
	.setName("huggingface-token")
	.setDescription("Set Hugging Face API token")
	.addStringOption((option) =>
		option.setName("token").setDescription("Token").setRequired(true),
	);
