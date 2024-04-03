export async function addCooldown(client, interaction, timeInSec) {
	try {
		const cooldowns = await client.prisma.guildCooldowns.findMany({
			where: {
				guildId: interaction.guild.id,
				commandName: interaction.commandName,
				uid: interaction.user.id,
			},
		});

		const endTimestamp = Number(cooldowns[0]?.endTimestamp);

		if (cooldowns?.length > 0 && endTimestamp >= Date.now()) {
			return endTimestamp / 1000 - Date.now() / 1000;
		} else {
			const cooldown = await client.prisma.guildCooldowns.upsert({
				where: {
					uid_guildId_commandName: {
						guildId: interaction.guild.id,
						commandName: interaction.commandName,
						uid: interaction.user.id,
					},
				},
				create: {
					guildId: interaction.guild.id,
					uid: interaction.user.id,
					commandName: interaction.commandName,
					endTimestamp: String(Date.now() + timeInSec * 1000),
				},
				update: {
					endTimestamp: String(Date.now() + timeInSec * 1000),
				},
			});
		}
	} catch (e) {
		console.error(e);
		return null;
	}
}
