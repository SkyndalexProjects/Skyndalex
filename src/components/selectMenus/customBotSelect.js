import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
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
	const getBot = await client?.users
		?.fetch(interaction.values[0])
		.catch(() => null);

	let botOnline = await find("name", `customBot ${interaction.values[0]}`);
	botOnline = botOnline[0];

	const embed = new EmbedBuilder()
		.setTitle("Manage your custom bot")
		.setDescription(`Current bot: **${getBot?.username || "Unkown"}**`)
		.setColor("DarkButNotBlack");

	const powerState = new ButtonBuilder()
		.setLabel(`${botOnline ? "Turn bot off" : "Turn bot on"}`)
		.setStyle(
			ButtonStyle[botOnline ? ButtonStyle.Danger : ButtonStyle.Success],
		)
		.setCustomId(`customBotPowerState-${interaction.values[0]}`);

	const deleteCustom = new ButtonBuilder()
		.setLabel("Delete")
		.setStyle(ButtonStyle.Danger)
		.setCustomId(`deleteCustomBot-${findUserBots[0]?.clientId}-${findUserBots[0]?.id}`);

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

	const row = new ActionRowBuilder().addComponents(select);
	const row2 = new ActionRowBuilder().addComponents(powerState, deleteCustom);

	await interaction.update({ embeds: [embed], components: [row, row2] }).catch((e) => {
		console.error(e)
		return interaction.update({ content: "Something went wrong during updating this message.", embeds: [] })
	});
}
