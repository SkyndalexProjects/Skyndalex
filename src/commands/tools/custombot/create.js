import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";

export async function run(client, interaction) {
	const embed = new EmbedBuilder()
		.setTitle("Create a custom bot")
		.setDescription(
			`You can create a custom bot by clicking the button below.`,
		)
		.setColor("DarkButNotBlack");

	const createButton = new ButtonBuilder()
		.setLabel("Create custom bot")
		.setStyle(ButtonStyle.Primary)
		.setCustomId(`createCustomBot-${interaction.user.id}`);

	const createBotActionRow = new ActionRowBuilder().addComponents(
		createButton,
	);

	return interaction.reply({
		embeds: [embed],
		components: [createBotActionRow],
		ephemeral: true,
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("create")
	.setDescription("Create a custom bot");
