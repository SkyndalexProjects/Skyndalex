import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const user = interaction.options.getUser("user") || interaction.user;
	const member = await interaction.guild.members.fetch(user.id);

	// EmbedBuilder from our classes has problems with showing joined and created timestamps.

	const embed = new EmbedBuilder()
		.setTitle(client.i18n.t("USER_INFO_TITLE", { lng: interaction.locale }))
		.addFields([
			{
				name: client.i18n.t("USER_GLOBAL_NAME", {
					lng: interaction.locale,
				}),
				value: member.user.globalName?.toString() || "None",
			},
			{
				name: client.i18n.t("USER_USERNAME", {
					lng: interaction.locale,
				}),
				value: member.user.username.toString(),
			},
			{
				name: client.i18n.t("USER_JOINED_SERVER", {
					lng: interaction.locale,
				}),
				value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
			},
			{
				name: client.i18n.t("USER_JOINED_DISCORD", {
					lng: interaction.locale,
				}),
				value: `<t:${Math.floor(
					member.user.createdTimestamp / 1000,
				)}:R>`,
			},
		])
		.setColor("Green")
		.setTimestamp()
		.setThumbnail(member.user.displayAvatarURL());

	return interaction.reply({ embeds: [embed] });
}
export const data = new SlashCommandBuilder()
	.setName("userinfo")
	.setDescription("Check user info")
	.addUserOption((option) =>
		option.setName("user").setDescription("User to check info for"),
	);
