import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const user1 = interaction.options.getUser("who");
	const user2 = interaction.options.getUser("to-who");
}

export const data = new SlashCommandBuilder()
	.setName("ship")
	.setDescription("Ship two users!")
	.addUserOption((option) =>
		option
			.setName("who")
			.setDescription("First user to ship")
			.setRequired(true),
	)
	.addUserOption((option) =>
		option
			.setName("to-who")
			.setDescription("Second user to ship")
			.setRequired(true),
	);
