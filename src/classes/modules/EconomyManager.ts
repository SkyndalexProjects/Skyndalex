import type { ChatInputCommandInteraction } from "discord.js";
import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";

interface GambleResult {
	isSuccess: boolean;
	amount: number;
	message: string;
}

export class EconomyManager {
	constructor(private readonly client: SkyndalexClient) {
		this.client = client;
	}
	async resolveGambleAction(
		interaction: ChatInputCommandInteraction,
		commandName: string,
		successChance: number,
	): Promise<GambleResult> {
		const userId = interaction.user.id;
		const isSuccess = Math.random() < successChance;
		const amount = Math.floor(Math.random() * 100) + 1;

		await this.setMoney(this.client, userId, isSuccess ? amount : -amount);

		const status = isSuccess ? "success" : "fail";
		const messagesKey = `economy.${commandName}.${status}`;

		const messages = this.client.i18n.t(messagesKey, {
			lng: interaction.locale,
			returnObjects: true,
		}) as string[];

		const randomIndex = Math.floor(Math.random() * messages.length);
		const message = messages[randomIndex].replace(
			"{{amount}}",
			amount.toString(),
		);

		const embed = new EmbedBuilder(this.client, interaction.locale)
			.setRawDescription(message)
			.setColor(isSuccess ? "Green" : "Red");

		await interaction.reply({ embeds: [embed] });

		return { isSuccess, amount, message };
	}

	async setMoney(
		client: SkyndalexClient,
		userId: string,
		value: number,
	): Promise<number> {
		if (value > 0) {
			const result = await client.prisma.economy.upsert({
				where: { userId: userId },
				update: { wallet: { increment: value } },
				create: { userId: userId, wallet: value },
			});
			return result.wallet;
		} else if (value < 0) {
			const result = await client.prisma.economy.update({
				where: { userId: userId },
				data: { wallet: { decrement: Math.abs(value) } },
			});
			return result.wallet;
		}

		const current = await client.prisma.economy.findUnique({
			where: { userId: userId },
		});
		return current?.wallet ?? 0;
	}
}
