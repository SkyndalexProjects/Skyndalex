import { EmbedBuilder } from "classes/builders/EmbedBuilder";
import { ButtonBuilder } from "classes/builders/components/ButtonBuilder";
import {
	ActionRowBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	const member = interaction.options.getMember("user");
	const reason = interaction.options.getString("reason");

	if (member.user.id === interaction.user.id)
		return interaction.reply({
			content: client.i18n.t("WARN_YOURSELF_PROHBITED", {
				lng: interaction.locale,
			}),
			ephemeral: true,
		});

	const newCase = await client.cases.add(
		interaction.guild.id,
		member.user.id,
		"warn",
		reason,
		interaction.user.id,
	);

	const deleteButton = new ButtonBuilder(client, interaction.locale)
		.setCustomId(`deleteCase-${newCase.id}-${member.user.id}-warn`)
		.setLabel("DELETE_CASE_BUTTON")
		.setStyle(ButtonStyle.Danger);

	const row = new ActionRowBuilder().addComponents(deleteButton);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("ADD_WARN_TITLE", {
			caseId: newCase.id,
		})
		.setColor("Yellow")
		.addFields([
			{
				name: "ADD_WARN_WARNED_USER",
				value: member.toString(),
			},
			{
				name: "ADD_WARN_REASON",
				value: reason || "NO_REASON_PROVIDED",
			},
		]);

	return await interaction.reply({ embeds: [embed], components: [row] });
}
export const data = {
	...new SlashCommandBuilder()
		.setName("warn")
		.setDescription("Warn user")
		.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription("The user to warn.")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("reason")
				.setDescription("The reason for the warn.")
				.setRequired(false),
		),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
