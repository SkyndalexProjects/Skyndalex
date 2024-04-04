import { EmbedBuilder } from "discord.js";
export async function run(client, interaction) {
	const token = interaction.fields.getTextInputValue(
		"customBotCreateModalToken",
	);
	const clientId = interaction.fields.getTextInputValue(
		"customBotCreateModalClientID",
	);

	if (clientId.length >= 19) return interaction.reply("The client ID is too long");
	if (token.length >= 100) return interaction.reply("The token is too long");

	await client.prisma.customBots.create({
		data: {
			userId: interaction.user.id,
			clientId: clientId,
			token: token,
		},
	});

	const embed = new EmbedBuilder()
		.setTitle(`Custom bot created`)
		.setDescription(
			`Your custom bot has been created.\nYou can manage it via **/custombot manage** command`,
		)
		.setColor("Green");

	return interaction.reply({
		embeds: [embed],
		ephemeral: true,
	});
}
