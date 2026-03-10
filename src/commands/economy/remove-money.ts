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
	if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
		return interaction.reply({
			content:
				"> You need the **Manage Guild** permission to use this command.",
		});
	}

	const target = interaction.options.getUser("target");
	const amount = Number(interaction.options.getString("amount"));

	const economy = await client.prisma.economy.findUnique({
		where: { userId: target?.id },
	});

	if (!economy) {
		return interaction.reply(
			"This user does not exists in the economy database!",
		);
	}

	await client.economy.setMoney(client, target?.id, -amount);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setRawDescription(`> Removed \`${amount}\` money from ${target} user.`)
		.setColor("DarkRed");

	return interaction.reply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
	.setName("remove-money")
	.setDescription("Remove money from the user balance")
	.addUserOption((option) =>
		option.setName("target").setDescription("To who?").setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("amount")
			.setDescription("Amount to transfer")
			.setRequired(true),
	);
