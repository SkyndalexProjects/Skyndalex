import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	ActionRowBuilder,
	ButtonStyle,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import {
	StringSelectMenuBuilder,
	EmbedBuilder,
	ButtonBuilder,
} from "#builders";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const custombots = await client.prisma.custombots.findMany({
		where: {
			userId: interaction.user.id,
		},
	});

	if (custombots.length <= 0) {
		return interaction.reply({
			content: "No custom bots found",
			ephemeral: true,
		});
	}

	const custombotsWithNames = await Promise.all(
		custombots.map(async (custombot) => {
			const bot = await client.users.fetch(custombot.clientId);
			return {
				...custombot,
				name: bot.username,
			};
		}),
	);

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

	const powerState = new ButtonBuilder(client, interaction.locale)
		.setCustomId(`customBotPowerState-${custombots[0].id}`)
		.setLabel("CUSTOM_BOT_POWER_STATE_ON")
		.setStyle(ButtonStyle.Success);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOM_BOT_MANAGE_TITLE")
		.setDescription("CUSTOM_BOT_CURRENT_DESC", {
			currentBot: custombotsWithNames[0].name,
			status: custombots[0].status,
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
	.setName("menu")
	.setDescription("Custom bot menu");
