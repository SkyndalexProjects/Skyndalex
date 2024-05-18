import type { SkyndalexClient } from "../classes/Client";

export async function updateWallet(
	client: SkyndalexClient,
	guildId: string,
	userId: string,
	amount: number,
) {
	const user = await client.prisma.economy.findFirst({
		where: { userId: userId },
	});

	const updateUser = await client.prisma.economy.upsert({
		where: {
			guildId_userId: {
				guildId: guildId,
				userId: userId,
			},
		},
		create: {
			guildId: guildId,
			userId: userId,
			wallet: amount.toString(),
		},
		update: {
			wallet: (Number.parseInt(user?.wallet || "0") + amount).toString(),
		},
	});

	if (!updateUser) return null;
	return updateUser;
}
