import type { MessageComponentInteraction } from "discord.js";

import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
	args: string[],
) {
	const collectibleId = args[0];

	if (!collectibleId) {
		return interaction.reply({
			content: "❌ Invalid collectible.",
			ephemeral: true,
		});
	}

	const collectible = await client.prisma.collectible.findUnique({
		where: {
			id: collectibleId,
		},
	});

	if (!collectible) {
		return interaction.reply({
			content: "❌ Collectible not found.",
			ephemeral: true,
		});
	}

	// Sprawdź właściciela
	if (collectible.userId !== interaction.user.id) {
		return interaction.reply({
			content: "❌ This collectible doesn't belong to you.",
			ephemeral: true,
		});
	}

	// Sprawdź status
	if (collectible.status !== "PENDING") {
		return interaction.reply({
			content: "❌ This collectible has already been collected.",
			ephemeral: true,
		});
	}

	// Sprawdź TTL
	if (collectible.expiresAt && collectible.expiresAt.getTime() <= Date.now()) {
		await client.prisma.collectible.update({
			where: {
				id: collectible.id,
			},
			data: {
				status: "EXPIRED",
			},
		});

		return interaction.reply({
			content: "⏰ This collectible has expired.",
			ephemeral: true,
		});
	}

	// Zablokuj collectible
	const updated = await client.prisma.collectible.updateMany({
		where: {
			id: collectible.id,
			userId: interaction.user.id,
			status: "PENDING",
			expiresAt: {
				gt: new Date(),
			},
		},
		data: {
			status: "ACTIVE",
			expiresAt: null,
		},
	});

	// Ktoś odebrał go wcześniej
	if (updated.count !== 1) {
		return interaction.reply({
			content: "❌ This collectible has already been collected or expired.",
			ephemeral: true,
		});
	}

	await interaction.reply({
		content:
			`🎨 **Collectible collected!**\n\n` +
			`✨ Rarity: **${collectible.rarity}**\n` +
			`💰 Value: **${collectible.value.toString()} 🪙**`,
		components: [],
	});
}
