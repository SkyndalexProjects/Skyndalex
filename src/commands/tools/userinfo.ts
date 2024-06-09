import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";
import { EmbedBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const user = interaction.options.getUser("user") || interaction.user;
	const member = await interaction.guild.members.fetch(user.id);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("USER_INFO_TITLE")
		.addFields([
			{
				name: "USER_USERNAME",
				value: user.username,
			},
			{
				name: "USER_JOINED_DISCORD",
				value: `<t:${Math.floor(
					member.user.createdTimestamp / 1000,
				)}:R>`,
			},
			{
				name: "USER_JOINED_SERVER",
				value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
			},
			{
				name: "USER_ROLES",
				value: member.roles.cache
					.map((role) => role.toString())
					.join(" "),
			},
		])
		.setColor("Green")
		.setTimestamp();


	return interaction.reply({ embeds: [embed] });
}
export const data = new SlashCommandBuilder()
	.setName("userinfo")
	.setDescription("Check user info")
	.addUserOption((option) =>
		option.setName("user").setDescription("User to check info for"),
	);
