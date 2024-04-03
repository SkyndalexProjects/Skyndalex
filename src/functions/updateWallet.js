export async function updateWallet(client, guildId, userId, amount) {
	const user = await client.prisma.economy.findFirst({
		where: { uid: userId },
	});

	const updateUser = await client.prisma.economy.upsert({
		where: {
			uid_guildId: {
				guildId: guildId,
				uid: userId,
			},
		},
		create: {
			guildId: guildId,
			uid: userId,
			wallet: amount.toString(),
		},
		update: { wallet: (parseInt(user?.wallet || "0") + amount).toString() },
	});

	if (!updateUser) return null;
	return updateUser;
}
