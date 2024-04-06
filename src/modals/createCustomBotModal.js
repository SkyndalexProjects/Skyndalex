import { EmbedBuilder, REST } from "discord.js";
export async function run(client, interaction) {
	const token = interaction.fields.getTextInputValue(
		"customBotCreateModalToken",
	);


	const toDecode = token.split(".")[0]

	const decode = Buffer.from(toDecode, 'base64').toString('utf-8')
	if (!decode) return interaction.reply("Invalid token format. I can't decode \`clientId\` parameter..");

	const rest = new REST({ version: "10" }).setToken(token)
	const req = await rest.get("/applications/@me").catch(() => null);

	if (!req) return interaction.reply({ content: "Invalid token. I can't fetch user data", ephemeral: true })

	await client.prisma.customBots.create({
		data: {
			userId: interaction.user.id,
			clientId: decode,
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
