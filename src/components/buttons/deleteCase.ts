import type { SkyndalexClient } from "classes/Client";
import { ButtonBuilder } from "classes/builders/components/ButtonBuilder";
import {
	ActionRowBuilder,
	ButtonStyle,
	type MessageComponentInteraction,
	PermissionsBitField,
} from "discord.js";
export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	if (
		!interaction.member.permissions.has([
			PermissionsBitField.Flags.ModerateMembers,
		])
	)
		return interaction.reply({
			content: "MISSING_PERMISSIONS",
			ephemeral: true,
		});
	const caseId = interaction.customId.split("-")[1];
	const memberId = interaction.customId.split("-")[2];
	if (interaction.user.id === memberId)
		return interaction.reply({
			content: client.i18n.t("DELETE_OWN_CASE_PROHIBITED", {
				lng: interaction.locale,
			}),
			ephemeral: true,
		});
	const caseType = interaction.customId.split("-")[3];

	await client.prisma.cases.delete({
		where: {
			id: Number.parseInt(caseId),
		},
	});

	const disableButton = new ButtonBuilder(client, interaction.locale)
		.setCustomId("disabled-button")
		.setDisabled(true)
		.setLabel("CASE_REVOKED")
		.setStyle(ButtonStyle.Secondary);

	const row = new ActionRowBuilder().addComponents(disableButton);
	switch (caseType) {
		case "timeout":
			const member = await interaction.guild.members.fetch(memberId);
			await member.timeout(null, "Revoked");
			break;
	}
	await interaction.update({ components: [row] });
}
