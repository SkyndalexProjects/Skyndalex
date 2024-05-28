import {
	type ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const amount = interaction.options.getInteger("amount");
	await interaction.channel.bulkDelete(amount);

	return interaction.reply(`Deleted \`${amount}\` messages`);
}
export const data = new SlashCommandBuilder()
	.setName("clear")
	.setDescription("this is clear")
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
	.addIntegerOption((option) =>
		option
			.setName("amount")
			.setDescription("Amount of messages to clear")
			.setMinValue(1)
			.setMaxValue(100)
			.setRequired(true),
	);
