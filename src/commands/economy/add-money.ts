import {
	type ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const target = interaction.options.getUser("target");

	const amount = Number(interaction.options.getString("amount"));

	if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
		return interaction.reply({
			content:
				"> You need the **Manage Guild** permission to use this command.",
		});
	} else {
		await client.economy.setMoney(client, target?.id, +amount);

		const embed = new EmbedBuilder(client, interaction.locale)
			.setRawDescription(`> Added \`${amount}\` money to ${target} user.`)
			.setColor("DarkGreen");

		return interaction.reply({ embeds: [embed] });
	}
}

export const data = new SlashCommandBuilder()
	.setName("add-money")
	.setDescription("Add money to the user balance")
	.addUserOption((option) =>
		option.setName("target").setDescription("To who?").setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("amount")
			.setDescription("Amount to transfer")
			.setRequired(true),
	);
