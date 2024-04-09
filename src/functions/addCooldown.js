export async function addCooldown(global, client, interaction, timeInSec) {
	try {
		if (!global) {
			// Guild cooldown (commands)
			const guildCooldowns = await client.prisma.guildCooldowns.findMany({
				where: {
					guildId: interaction.guild.id,
					commandName: interaction.commandName,
					uid: interaction.user.id,
				},
			});
			const endTimestamp = Number(guildCooldowns[0]?.endTimestamp);

			if (guildCooldowns?.length > 0 && endTimestamp >= Date.now()) {
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
		} else {
			// Global cooldown (interactions)

			const globalCooldowns = await client.prisma.globalCooldowns.findMany({
				where: {
					uid: interaction.user.id,
					interactionName: interaction.customId,
				},
			});
			const endTimestamp = Number(globalCooldowns[0]?.endTimestamp);

			if (globalCooldowns?.length > 0 && endTimestamp >= Date.now()) {
				return endTimestamp / 1000 - Date.now() / 1000;
			} else {
				const cooldown = await client.prisma.globalCooldowns.upsert({
					where: {
						uid_interactionName: {
							uid: interaction.user.id,
							interactionName: interaction.customId,
						},
					},
					create: {
						uid: interaction.user.id,
						interactionName: interaction.customId,
						endTimestamp: String(Date.now() + timeInSec * 1000),
					},
					update: {
						endTimestamp: String(Date.now() + timeInSec * 1000),
					},
				});
			}
		}
	} catch (e) {
		console.error(e);
		return null;
	}
}
