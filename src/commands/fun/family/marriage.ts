import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	ButtonStyle,
	ActionRowBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../../classes/Client.js";
import { ButtonBuilder, EmbedBuilder } from "#builders";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const user = interaction.options.getUser("user");
	if (user.bot)
		return interaction.reply({
			content: client.i18n.t("MARRY_BOT", {
				lng: interaction.locale,
			}),
			ephemeral: true,
		});
	const yes = new ButtonBuilder(client, interaction.locale)
		.setStyle(ButtonStyle.Success)
		.setLabel("MARRY_YES")
		.setCustomId(`accept-marriage-${user.id}`);
	const no = new ButtonBuilder(client, interaction.locale)
		.setStyle(ButtonStyle.Danger)
		.setLabel("MARRY_NO")
		.setCustomId(`decline-marriage-${user.id}`);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("MARRY_TITLE")
		.setDescription("MARRY_DESC", {
			author: interaction.user.username,
			user: user.username,
		})
		.setColor("#fb00ff")
		.setTimestamp();

	return interaction.reply({
		embeds: [embed],
		components: [
			new ActionRowBuilder<ButtonBuilder>({
				components: [yes, no],
			}),
		],
		content: `<@${user.id}>`,
	});
}

export const data = new SlashCommandSubcommandBuilder()
	.setName("marriage")
	.setDescription("Marriage with someone")
	.addUserOption((option) =>
		option
			.setName("user")
			.setDescription("User to marry with")
			.setRequired(true),
	);
