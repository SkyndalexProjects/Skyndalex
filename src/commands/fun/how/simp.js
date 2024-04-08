import {
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
} from "discord.js";

export async function run(client, interaction) {
	await interaction.deferReply();
	const random = Math.floor(Math.random() * 100);

	if (interaction.options.getUser("user").id === interaction.user.id) return interaction.editReply("You are 100% simp");


	const embed = new EmbedBuilder()
		.setDescription(
			`${interaction.options.getUser(
				"user",
			)} is ${random}% ${interaction.options.getSubcommand()}`,
		)
		.setColor("#0cfdd2");
	await interaction.editReply({ embeds: [embed] });
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("simp")
	.setDescription("How simp?")
	.addUserOption((option) =>
		option.setName("user").setDescription("User").setRequired(true),
	);
