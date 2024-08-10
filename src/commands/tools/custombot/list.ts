import {
	ActionRowBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
} from "discord.js";
import {
	ButtonBuilder,
	EmbedBuilder,
	StringSelectMenuBuilder,
} from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const custombots = await client.custombots.findCustomBots(
		interaction.user.id,
	);

	if (custombots.length <= 0) {
		return interaction.reply({
			content: "No custom bots found",
			ephemeral: true,
		});
	}

	const custombotsWithNames =
		await client.custombots.getCustomBotNames(custombots);

	const customBotSelect = new StringSelectMenuBuilder(
		client,
		interaction.locale,
	)

		.setPlaceholder("CUSTOM_BOT_SELECT_PLACEHOLDER")
		.setCustomId("customBot")
		.addOptions(
			custombotsWithNames.map((custombot) => ({
				label: custombot.name,
				value: custombot.id.toString(),
			})),
		);

	const botOnline = custombots[0].status === "online";

	console.log(botOnline);
	const powerState = new ButtonBuilder(client, interaction.locale)
		.setCustomId(`customBotPowerState-${custombots[0].id}`)
		.setLabel(
			`${client.i18n.t(
				`CUSTOM_BOT_POWER_STATE_${botOnline ? "OFF" : "ON"}`,
			)}`,
		)
		.setStyle(botOnline ? ButtonStyle.Danger : ButtonStyle.Success);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOM_BOT_MANAGE_TITLE")
		.setDescription("CUSTOM_BOT_CURRENT_DESC", {
			currentBot: custombotsWithNames[0].name,
			botId: custombots[0].id,
			activity: custombots[0].activity,
		})
		.setColor("DarkAqua");

	const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		customBotSelect,
	);
	const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
		powerState,
	);

	return interaction.reply({
		embeds: [embed],
		components: [row, row2],
		ephemeral: true,
	});
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("list")
	.setDescription("Custombots list");
