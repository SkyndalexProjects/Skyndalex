import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	PermissionFlagsBits,
	ButtonStyle,
	ActionRowBuilder,
} from "discord.js";
import { ButtonBuilder } from "classes/builders/components/ButtonBuilder";
import type { SkyndalexClient } from "../../classes/Client";
import { EmbedBuilder } from "classes/builders/EmbedBuilder";
import ms from "ms";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	try {
		const member = interaction.options.getMember("user");
		const time = interaction.options.getString("time");
		const reason = interaction.options.getString("reason");

		if (member.user.id === interaction.user.id)
			return interaction.reply({
				content: client.i18n.t("TIMEOUT_YOURSELF_PROHBITED", {
					lng: interaction.locale,
				}),
				ephemeral: true,
			});

		const newCase = await client.prisma.cases.create({
			data: {
				guildId: interaction.guild.id,
				userId: member.user.id,
				type: "timeout",
				reason: reason,
				moderator: interaction.user.id,
				duration: time,
			},
		});
		console.log(newCase);
		const convertedTime = await ms(time);

		await member.timeout(convertedTime, reason);
		const deleteButton = new ButtonBuilder(client, interaction.locale)
			.setCustomId(`deleteCase-${newCase.id}-${member.user.id}-timeout`)
			.setLabel("DELETE_CASE_BUTTON")
			.setStyle(ButtonStyle.Danger);

		const row = new ActionRowBuilder().addComponents(deleteButton);

		const embed = new EmbedBuilder(client, interaction.locale)
			.setTitle("SET_TIMEOUT_TITLE")
			.setColor("Yellow")
			.addFields([
				{
					name: "SET_TIMEOUT_USER",
					value: member.toString(),
				},
				{
					name: "SET_TIMEOUT_REASON",
					value: reason || "NO_REASON_PROVIDED",
				},
				{
					name: "SET_TIMEOUT_DURATION",
					value: time,
				},
			]);

		return await interaction.reply({ embeds: [embed], components: [row] });
	} catch (e) {
		return interaction.reply({
			content: client.i18n.t("TIMEOUT_FAILED", {
				lng: interaction.locale,
			}),
		});
	}
}
export const data = new SlashCommandBuilder()
	.setName("timeout")
	.setDescription("Timeout a user for a certain amount of time.")
	.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
	.addUserOption((option) =>
		option
			.setName("user")
			.setDescription("The user to timeout.")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("time")
			.setDescription(
				"The amount of time to timeout the user for. (e.g 1d, 5m, 5mo, 5y)",
			)
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("reason")
			.setDescription("The reason for the timeout.")
			.setRequired(false),
	);
