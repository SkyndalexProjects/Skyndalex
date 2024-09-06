import { type MessageComponentInteraction, EmbedBuilder } from "discord.js";
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
	const embed = EmbedBuilder.from(interaction.message.embeds[0]).setFooter({
		text: client.i18n.t("PETITION_CREATED_FOOTER", {
			lng: interaction.locale,
			signs: getPetition.signedCount,
		}),
		iconURL: client.user.displayAvatarURL(),
	});

	await interaction.update({ embeds: [embed] });
}
