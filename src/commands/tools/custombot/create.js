import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";

export async function run(client, interaction) {
	const getUserCustoms = await client.prisma.customBots.findMany({
		where: {
			userId: interaction.user.id,
		},
	});
	const countUserCustoms = getUserCustoms.length;
	if (countUserCustoms >= process.env.CUSTOMS_LIMIT)
		return interaction.reply(
			`You have reached the limit of ${process.env.CUSTOMS_LIMIT} custom bots.`,
		);

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
