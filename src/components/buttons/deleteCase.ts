import type { SkyndalexClient } from "../../classes/Client.js";
import { ButtonBuilder } from "#builders";
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
	try {
		const caseId = interaction.customId.split("-")[1];
		const memberId = interaction.customId.split("-")[2];
		const caseType = interaction.customId.split("-")[3];

		if (interaction.guild) {
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
		}

		if (interaction.user.id !== interaction?.message?.interaction?.user?.id)
			return interaction.reply({
				content: "You can't use this button!",
				ephemeral: true,
			});

		await client.cases.remove(caseId);

		const disableButton = new ButtonBuilder(client, interaction.locale)
			.setCustomId("disabled-button")
			.setDisabled(true)
			.setLabel("CASE_REVOKED")
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			disableButton,
		);
		const member = await interaction?.guild?.members?.fetch(memberId);

		switch (caseType) {
			case "timeout":
				await member.timeout(null, "Revoked");
				break;
			case "ban":
				await interaction.guild.members.unban(memberId);
				break;
		}
		await interaction.update({ components: [row] });
	} catch (e) {
		console.error("e", e);
		const buttonError = new ButtonBuilder(client, interaction.locale)
			.setCustomId("disabled-button")
			.setDisabled(true)
			.setLabel("ERROR_BUTTON_DELETE_CASE")
			.setStyle(ButtonStyle.Secondary);
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
			buttonError,
		);

		await interaction.update({ components: [row] });
	}
}
