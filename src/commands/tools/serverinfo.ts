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
	const guild = await client.guilds.cache.get(interaction.guild.id);

	console.log("guild", guild);
	const embed = new EmbedBuilder()
		.setTitle(
			client.i18n.t("SERVER_INFO_TITLE", { lng: interaction.locale }),
		)
		.setDescription(
			guild.description ||
				client.i18n.t("SERVER_NO_DESCRIPTION", {
					lng: interaction.locale,
				}),
		)
		.addFields([
			{
				name: client.i18n.t("SERVER_NAME", { lng: interaction.locale }),
				value: guild.name,
			},
			{
				name: client.i18n.t("SERVER_USER_COUNT", {
					lng: interaction.locale,
				}),
				value: guild.memberCount.toString(),
			},
			{
				name: client.i18n.t("SERVER_EMOJIS", {
					lng: interaction.locale,
				}),
				value: guild.emojis.cache
					.map((emoji) => emoji.toString())
					.join(" "),
			},
			{
				name: client.i18n.t("SERVER_ROLES_LIST", {
					lng: interaction.locale,
				}),
				value: guild.roles.cache
					.map((role) => role.toString())
					.join(" "),
			},
		])
		.setColor("Green")
		.setTimestamp();

	return interaction.reply({ embeds: [embed] });
}
export const data = new SlashCommandBuilder()
	.setName("serverinfo")
	.setDescription("Check server info");
