import { EmbedBuilder, ButtonBuilder } from "#builders";
import {
	ActionRowBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	const user = interaction.options.getUser("user");
	const reason = interaction.options.getString("reason");

	console.log("interaction", interaction);
	if (user.id === interaction.user.id)
		return interaction.reply({
			content: client.i18n.t("WARN_YOURSELF_PROHBITED", {
				lng: interaction.locale,
			}),
			ephemeral: true,
		});

	const guildId = interaction.guild
		? interaction.guild.id
		: `DN:${interaction.channelId}`;
	const newCase = await client.cases.add(
		guildId,
		user.id,
		interaction.commandName,
		reason,
		interaction.user.id,
	);

	const deleteButton = new ButtonBuilder(client, interaction.locale)
		.setCustomId(`deleteCase-${newCase.id}-${user.id}-warn`)
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
				value: user.username.toString(),
			},
			{
				name: "ADD_WARN_REASON",
				value: reason || "NO_REASON_PROVIDED",
			},
		]);

	return await interaction.reply({
		embeds: [embed],
		components: [
			new ActionRowBuilder<ButtonBuilder>({
				components: [deleteButton],
			}),
		],
	});
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
				.setRequired(false)
				.setMaxLength(230)
				.setMinLength(1),
		),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
