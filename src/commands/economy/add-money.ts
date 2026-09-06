import {
	type ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const target = interaction.options.getUser("target");

	console.log("target.bot", target?.bot);
	if (target?.bot) {
		return interaction.reply({
			content:
				"```ansi\n❌ | \u001b[2;31m\u001b[2;40mCannot add money to the bot\u001b[0m\n```",
		});
	}

	if (!target) return;

	const amount = Number(interaction.options.getString("amount"));

	if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
		return interaction.reply({
			content:
				"```ansi\n❌ | \u001b[2;31m\u001b[2;40mYou need the Manage Guild permission to use this command.\u001b[0m\n```",
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
