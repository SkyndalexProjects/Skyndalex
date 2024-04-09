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
	const selectedClientId = interaction.customId.split("-")[1];
	let embedMessage = new EmbedBuilder();
	embedMessage.setTitle("Manage your custombot").setColor("Red");

	const select = new StringSelectMenuBuilder()
		.setCustomId("customBotSelect")
		.setPlaceholder("Choose a custombot!");

	const powerStateOff = new ButtonBuilder()
		.setLabel("Turn bot off")
		.setStyle(ButtonStyle.Danger)
		.setCustomId(`customBotPowerState-${selectedClientId}`);

	const powerStateOn = new ButtonBuilder()
		.setLabel("Turn bot on")
		.setStyle(ButtonStyle.Success)
		.setCustomId(`customBotPowerState-${selectedClientId}`);

	const disabledButton = new ButtonBuilder()
		.setLabel("Turn bot on")
		.setStyle(ButtonStyle.Success)
		.setDisabled(true)
		.setCustomId("a co to robi");

	const deployCommands = new ButtonBuilder()
		.setLabel("Deploy commands")
		.setStyle(ButtonStyle.Primary)
		.setCustomId(`deployCommands-${selectedClientId}`);

	const turnOnactionRow = new ActionRowBuilder().addComponents(powerStateOff);
	const turnOffactionRow = new ActionRowBuilder().addComponents(powerStateOn);
	const disableAction = new ActionRowBuilder().addComponents(disabledButton);
	const deployCommandsActionRow = new ActionRowBuilder().addComponents(deployCommands);
	const selectRow = new ActionRowBuilder().addComponents(select);

	const findUserBots = await client.prisma.customBots.findMany({
		where: {
			userId: interaction.user.id,
		},
	});

	for (const bot of findUserBots) {
		const getBot = await client.users.fetch(bot.clientId).catch(() => null);

		select.addOptions(
			new StringSelectMenuOptionBuilder()
				.setLabel(`Custom bot: ${getBot?.username || "Unknown"}`)
				.setValue(bot.clientId),
		);
	}

	await interaction.deferUpdate({ ephemeral: true });

	const getBot = await client.users.fetch(selectedClientId).catch(() => null);
	if (!getBot) {
		embedMessage.setDescription(
			`Current bot: **Unkown**\nCurrent bot status: <:offline:1062072773406642226> | **Invalid bot**`,
		);
		await interaction.editReply({
			embeds: [embedMessage],
			components: [selectRow, disableAction],
		});
	} else {
		embedMessage.setDescription(
			`Current bot: **${
				getBot?.username || "Unkown"
			}**\nCurrent bot status: <a:4704loadingicon:1183416396223352852> | **Preparing**`,
		);
		await interaction.editReply({
			content: "",
			embeds: [embedMessage],
			components: [selectRow, disableAction],
			ephemeral: true,
		});

		const bot = await find("name", `customBot ${selectedClientId}`);

		const getToken = await client.prisma.customBots.findMany({
			where: {
				userId: interaction.user.id,
				clientId: selectedClientId,
			},
		});

		const token = getToken[0]?.token;

		if (bot[0]?.pid) {
			await interaction.editReply({ components: [turnOffactionRow] });

			embedMessage.setDescription(
				`Current bot: **${getBot.username}**\nCurrent bot status: <a:4704loadingicon:1183416396223352852> | **Turning off**`,
			);
			embedMessage.setColor("DarkButNotBlack");
			await interaction.editReply({
				content: "",
				embeds: [embedMessage],
				ephemeral: true,
			});

			console.log("bot", bot[0].pid);
			const k = process.kill(bot[0].pid);
			console.log("k", k);
			embedMessage.setDescription(
				`Current bot: **${getBot.username}**\nCurrent bot status: <:offline:1062072773406642226>  | **Offline** (Turned off)`,
			);
			embedMessage.setColor("Red");
			await interaction.editReply({
				content: "",
				embeds: [embedMessage],
				components: [turnOffactionRow, selectRow],
				ephemeral: true,
			});
		} else {
			embedMessage.setDescription(
				`Current bot: **${getBot.username}**\nCurrent bot status: <a:4704loadingicon:1183416396223352852> | **Turning on**`,
			);
			embedMessage.setColor("DarkButNotBlack");
			await interaction.editReply({
				embeds: [embedMessage],
				ephemeral: true,
			});

			await client.customBotManager.init(selectedClientId, token);
			embedMessage.setDescription(
				`Current bot: **${getBot.username}**\nCurrent bot status: <:online:1062072775583485973> | **Online**`,
			);
			embedMessage.setColor("Green");

			await interaction.editReply({
				content: "",
				embeds: [embedMessage],
				ephemeral: true,
				components: [turnOnactionRow, deployCommandsActionRow, selectRow],
			});
		}
	}
}
