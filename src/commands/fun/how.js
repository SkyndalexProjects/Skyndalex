import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
export async function run(client, interaction) {
	await interaction.deferReply();
	const random = Math.floor(Math.random() * 100);

	console.log(interaction);

	if (interaction.options.getUser("user") === interaction.user)
		return interaction.reply("Noob");

	const embed = new EmbedBuilder()
		.setDescription(
			`${interaction.options.getUser(
				"user",
			)} is ${random}% ${interaction.options.getSubcommand()}`,
		)
		.setColor("#0cfdd2");
	await interaction.editReply({ embeds: [embed] });
}
export const data = new SlashCommandBuilder()
	.setName("how")
	.setDescription("How?")
	.addSubcommand((sub) =>
		sub
			.setName("gay")
			.setDescription("Gay?")
			.addUserOption((option) =>
				option.setName("user").setDescription("User").setRequired(true),
			),
	)
	.addSubcommand((sub) =>
		sub
			.setName("simp")
			.setDescription("Simp?")
			.addUserOption((option) =>
				option.setName("user").setDescription("User").setRequired(true),
			),
	);
