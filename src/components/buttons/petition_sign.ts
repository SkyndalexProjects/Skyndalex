import type { MessageComponentInteraction } from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction<"cached">,
) {
	const [customId, petitionId, authorId] = interaction.customId.split("-");

	const getPetition = await client.prisma.petitions.findFirst({
		where: {
			id: parseInt(petitionId),
			author: authorId,
		},
	});

	await client.prisma.petitions.update({
		where: {
			id: parseInt(petitionId),
		},
		data: {
			signedCount: getPetition.signedCount + 1,
		},
	});

	await interaction.update({
		embeds: [
			{
				title: interaction.message.embeds[0].title,
				description: interaction.message.embeds[0].description,
				color: interaction.message.embeds[0].color,
				footer: {
					text: client.i18n.t("PETITION_CREATED_FOOTER", {
						lng: interaction.locale,
						signs: getPetition.signedCount + 1,
					}),
					icon_url: client.user?.displayAvatarURL(),
				},
			},
		],
	});
}
