import type { SkyndalexClient } from "../../classes/Client.js";
import { EmbedBuilder } from "../../classes/builders/EmbedBuilder.js";
import type { MessageComponentInteraction } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	const value = interaction.customId.split("-")[1];

	switch (value) {
		case "marriage":
			{
				const user = interaction.customId.split("-")[2];

				if (interaction.user.id !== user)
					return interaction.reply({
						content: client.i18n.t("MARRY_NOT_YOU", {
							lng: interaction.locale,
						}),
						ephemeral: true,
					});

				await client.prisma.users.upsert({
					where: {
						userId_guildId: {
							userId: interaction.user.id,
							guildId: interaction.guild.id,
						},
					},
					create: {
						userId: interaction.user.id,
						guildId: interaction.guild.id,
						marriedTo: user,
					},
					update: {
						marriedTo: user,
					},
				});

				const embedMarried = new EmbedBuilder(
					client,
					interaction.locale,
				)
					.setTitle("MARRIED_TITLE")
					.setDescription("MARRIED_DESC", {
						author: interaction.user.username,
						user: client.users.cache.get(user).username || "Bruh",
					})
					.setColor("DarkVividPink")
					.setTimestamp();

				await interaction.update({
					components: [],
					embeds: [embedMarried],
				});
			}
			break;
	}
}
