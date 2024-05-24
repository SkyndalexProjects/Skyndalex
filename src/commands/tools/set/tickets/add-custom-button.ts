import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "../../../../classes/Client";
import { EmbedBuilder } from "classes/builders/EmbedBuilder";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const label = interaction.options.getString("label");
	const style = interaction.options.getString("style");

	await client.prisma.ticketButtons.create({
		data: {
			label,
			style,
			guildId: interaction.guild.id,
		},
	});

	const embedSuccess = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOM_BUTTON_ADD_SUCCESS")
		.setDescription("CUSTOM_BUTTON_ADD_SUCCESS_DESCRIPTION", {
			name: label,
			button: style,
		})
		.setColor("Green");

	return interaction.reply({ embeds: [embedSuccess] });
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("add-custom-button")
	.setDescription("Add custom button")
	.addStringOption((option) =>
		option
			.setName("label")
			.setDescription("Button label")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("style")
			.setDescription("Button style")
			.addChoices(
				{ name: "Primary", value: "PRIMARY" },
				{ name: "Secondary", value: "SECONDARY" },
				{ name: "Success", value: "SUCCESS" },
				{ name: "Danger", value: "DANGER" },
			)
			.setRequired(true),
	);
