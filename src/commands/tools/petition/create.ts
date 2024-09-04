import {
	ActionRowBuilder,
	ButtonStyle,
	SlashCommandSubcommandBuilder,
	type ChatInputCommandInteraction,
} from "discord.js";
import { SkyndalexClient } from "#classes";
import { ButtonBuilder, EmbedBuilder } from "#builders";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const data = await client.prisma.petitions.create({
		data: {
			author: interaction.user.id,
			signedCount: 0,
		},
	});

	const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder(client, interaction.locale)
			.setCustomId(`petition_sign-${data.id}-${interaction.user.id}`)
			.setLabel("PETITION_SIGN")
			.setStyle(ButtonStyle.Success)
			.setDisabled(false),
		new ButtonBuilder(client, interaction.locale)
			.setCustomId(`petition_close-${data.id}-${interaction.user.id}`)
			.setLabel("PETITION_CLOSE")
			.setStyle(ButtonStyle.Danger)
			.setDisabled(false),
	);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("PETITION_CREATED")
		.setDescription("PETITION_CREATED_DESC", {
			title: interaction.options.getString("title"),
			description: interaction.options.getString("description"),
		})
		.setFooter({
			text: "PETITION_CREATED_FOOTER",
			textArgs: { signs: "0" },
			iconURL: client.user?.displayAvatarURL(),
		})
		.setColor("Green");

	return interaction.reply({ embeds: [embed], components: [buttons] });
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("create")
	.setDescription("Create petition")
	.addStringOption((option) =>
		option
			.setName("title")
			.setDescription("Title of the petition")
			.setRequired(true),
	)
	.addStringOption((option) =>
		option
			.setName("description")
			.setDescription("Description of the petition"),
	);
