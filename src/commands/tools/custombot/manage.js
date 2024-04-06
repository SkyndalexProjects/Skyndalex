import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandSubcommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import find from "find-process";

export async function run(client, interaction) {
	const findUserBots = await client.prisma.customBots.findMany({
		where: {
			userId: interaction.user.id,
		},
	});

	if (findUserBots.length === 0)
		return interaction.reply({
			content:
				"It seems that you dont have any custombots in your account. Add some with `/custombot create` command.",
			ephemeral: true,
		});

	// Get custombot client id via discord API

	const fetchClientId = await fetch("https://discord.com/api/v9/users/@me", {
		headers: {
			Authorization: `Bot ${findUserBots[0]?.token}`,
		},
	});
	const select = new StringSelectMenuBuilder()
		.setCustomId("customBotSelect")
		.setPlaceholder("Choose a custombot!");

	for (const bot of findUserBots) {
		const getBot = await client.users.fetch(bot.clientId).catch(() => null);

		select.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(`Custom bot: ${getBot?.username || "Unknown"}`)
				.setValue(bot.clientId),
		);
	}
	let botOnline = await find(
		"name",
		`customBot ${findUserBots[0]?.clientId}`,
	);
	botOnline = botOnline[0];

	const powerState = new ButtonBuilder()
		.setLabel(`${botOnline ? "Turn bot off" : "Turn bot on"}`)
		.setStyle(
			ButtonStyle[botOnline ? ButtonStyle.Danger : ButtonStyle.Success],
		)
		.setCustomId(`customBotPowerState-${findUserBots[0]?.clientId}`);

	const deleteCustom = new ButtonBuilder()
		.setLabel("Delete")
		.setStyle(ButtonStyle.Danger)
		.setCustomId(
			`deleteCustomBot-${findUserBots[0]?.clientId}-${findUserBots[0]?.id}`,
		);
	const row = new ActionRowBuilder().addComponents(select);
	const row2 = new ActionRowBuilder().addComponents(powerState, deleteCustom);

	const getBot = await client.users
		.fetch(findUserBots[0]?.clientId)
		.catch(() => null);

	const embed = new EmbedBuilder()
		.setTitle(`Manage your custom bot`)
		.setDescription(
			`Current bot: **${getBot?.username || "Unkown"}** [ID: \`${
				findUserBots[0]?.id
			}\`]`,
		)
		.setColor("DarkButNotBlack");

	return interaction.reply({
		embeds: [embed],
		components: [row, row2],
		ephemeral: true,
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("manage")
	.setDescription("Manage a custom bot");
