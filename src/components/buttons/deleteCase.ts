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
	interaction: MessageComponentInteraction<"cached">,
) {
	const caseId = interaction.customId.split("-")[1];
	const memberId = interaction.customId.split("-")[2];
	const caseType = interaction.customId.split("-")[3];

	if (
		!interaction.member.permissions.has([
			PermissionsBitField.Flags.BanMembers,
		]) ||
		interaction.user.id === memberId
	) {
		return interaction.reply({
			content: !interaction.member.permissions.has([
				PermissionsBitField.Flags.BanMembers,
			])
				? "MISSING_PERMISSIONS"
				: client.i18n.t("DELETE_OWN_CASE_PROHIBITED", {
						lng: interaction.locale,
					}),
			ephemeral: true,
		});
	}

	await client.cases.remove(caseId);

	const disableButton = new ButtonBuilder(client, interaction.locale)
		.setCustomId("disabled-button")
		.setDisabled(true)
		.setLabel("CASE_REVOKED")
		.setStyle(ButtonStyle.Secondary);

	const row = new ActionRowBuilder().addComponents(disableButton);
	const member = await client.users.fetch(memberId);

	switch (caseType) {
		case "timeout":
			await member.timeout(null, "Revoked");
			break;
		case "ban":
			await interaction.guild.members.unban(memberId);
			break;
	}
	await interaction.update({ components: [row] });
}
