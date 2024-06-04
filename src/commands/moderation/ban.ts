import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	PermissionFlagsBits,
	ButtonStyle,
	ActionRowBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client.js";
import { EmbedBuilder, ButtonBuilder} from "#builders";
import ms from "ms";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction<"cached">,
) {
	try {
		const member = interaction.options.getUser("user");
		console.log("member", member);
		const reason = interaction.options.getString("reason");
		const messages =
			interaction.options.getString("delete-messages-time") || 0;

		if (member.id === interaction.user.id)
			return interaction.reply({
				content: client.i18n.t("BAN_YOURSELF_PROHBITED", {
					lng: interaction.locale,
				}),
				ephemeral: true,
			});

		const newCase = await client.cases.add(
			interaction.guild.id,
			member.id,
			interaction.commandName,
			reason,
			interaction.user.id,
		);
		const messagesToDeleteSeconds = Math.floor((await ms(messages)) / 1000);

		await interaction.guild.members.ban(member.id, {
			reason: reason,
			deleteMessageSeconds: messagesToDeleteSeconds,
		});

		const deleteButton = new ButtonBuilder(client, interaction.locale)
			.setCustomId(`deleteCase-${newCase.id}-${member.id}-ban`)
			.setLabel("DELETE_CASE_BUTTON")
			.setStyle(ButtonStyle.Danger);

		const embed = new EmbedBuilder(client, interaction.locale)
			.setTitle("BAN_TITLE", {
				caseId: newCase.id,
			})
			.setColor("Red")
			.addFields([
				{
					name: "BANNED_USER",
					value: member.toString(),
				},
				{
					name: "BAN_REASON",
					value: reason || "NO_REASON_PROVIDED",
				},
				{
					name: "DELETED_MESSAGES",
					value: messages.toString(),
				},
			]);

		return interaction.reply({
			embeds: [embed],
			components: [
				new ActionRowBuilder<ButtonBuilder>({
					components: [deleteButton],
				}),
			],
		});
	} catch (e) {
		console.error(e);
		return interaction.reply({
			content: client.i18n.t("BAN_FAILED", {
				lng: interaction.locale,
			}),
		});
	}
}
export const data = new SlashCommandBuilder()
	.setName("ban")
	.setDescription("Ban user")
	.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
	.addUserOption((option) =>
		option
			.setName("user")
			.setDescription("The user to ban.")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("delete-messages-time")
			.setDescription("The amount of time to delete messages"),
	)
	.addStringOption((option) =>
		option.setName("reason").setDescription("The reason for the ban."),
	);
