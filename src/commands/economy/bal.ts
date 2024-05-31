import { EmbedBuilder } from "classes/builders/EmbedBuilder";
import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client.js";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const guildUser = interaction.options.getUser("user") || interaction.user;

	const user = await client.prisma.economy.findFirst({
		where: {
			userId: guildUser.id,
		},
	});
	console.log("user", user);
	if (!user) {
		return interaction.reply(
			client.i18n.t("ECONOMY_USER_NOT_FOUND", {
				user: guildUser.username,
			}),
		);
	}

	const wallet = user.wallet !== null ? BigInt(user.wallet) : BigInt(0);
	const bank = user.bank !== null ? BigInt(user.bank) : BigInt(0);
	const all = (wallet + bank).toLocaleString("en");

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("ECONOMY_BAL_TITLE")
		.addFields([
			{
				name: "ECONOMY_BAL_WALLET",
				value: wallet.toLocaleString("en"),
			},
			{
				name: "ECONOMY_BAL_BANK",
				value: bank.toLocaleString("en"),
			},
			{
				name: "ECONOMY_BAL_TOTAL",
				value: all,
			},
		])
		.setColor("Blurple");

	return interaction.reply({ embeds: [embed] });
}

export const data = new SlashCommandBuilder()
	.setName("bal")
	.setDescription("Bal")
	.addUserOption((option) =>
		option
			.setName("user")
			.setDescription("User to check balance")
			.setRequired(false),
	);
