import type { SkyndalexClient } from "#classes";
import { EmbedBuilder } from "#builders";
import { getSelects } from "#utils";
import type { StringSelectMenuInteraction } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: StringSelectMenuInteraction,
) {
	const value = interaction.values[0];
	const embedData = interaction.message.embeds[0].fields[0];

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("TICKETS_SETUP_TITLE")
		.setDescription("TICKETS_SETUP_STATUS")
		.addFields([
			{
				name: "TICKETS_SETUP_CREATING_BUTTON_NAME",
				value: embedData.value,
				inline: true,
			},
			{
				name: "TICKETS_SETUP_CATEGORY_SET",
				value: `<#${value}> [\`${value}\`]`,
				inline: true,
			},
		])
		.setFooter({
			text: "SUPPORT_INVITE_FOOTER",
			iconURL: client.user.displayAvatarURL(),
		})
		.setTimestamp()
		.setColor("Blurple")
		.setThumbnail(client.user.displayAvatarURL());

	const components = await getSelects(
		client,
		interaction.guildId,
		interaction.locale,
	);
	await interaction.update({
		embeds: [embed],
		components: [components.creationMenu, components.buttonMenu],
	});
}
