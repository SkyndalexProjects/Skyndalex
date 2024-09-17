import { EmbedBuilder, type MessageComponentInteraction } from "discord.js";
import type { SkyndalexClient } from "#classes";
export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction<"cached">,
) {
	const [customId, petitionId, authorId] = interaction.customId.split("-");

	const getPetition = await client.prisma.petitions.findFirst({
		where: {
			id: Number.parseInt(petitionId),
			author: authorId,
		},
	});
	const checkIfAlreadySigned =
		await client.prisma.alreadySignedPetitions.findFirst({
			where: {
				petitionId: Number.parseInt(petitionId),
				userId: interaction.user.id,
			},
		});

	if (checkIfAlreadySigned) {
		return interaction.reply({
			content: client.i18n.t("ALREADY_SIGNED", {
				lng: interaction.locale,
			}),
			ephemeral: true,
		});
	}

	await client.prisma.alreadySignedPetitions.create({
		data: {
			petitionId: Number.parseInt(petitionId),
			userId: interaction.user.id,
		},
	});

	const updatedCount = await client.prisma.petitions.update({
		where: {
			id: Number.parseInt(petitionId),
		},
		data: {
			signedCount: getPetition.signedCount + 1,
		},
	});

	const embed = EmbedBuilder.from(interaction.message.embeds[0]).setFooter({
		text: client.i18n.t("PETITION_CREATED_FOOTER", {
			lng: interaction.locale,
			signs: updatedCount.signedCount,
		}),
		iconURL: client.user.displayAvatarURL(),
	});

	await interaction.update({ embeds: [embed] });
}
