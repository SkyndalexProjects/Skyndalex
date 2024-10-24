import {
	ActionRowBuilder,
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	TextInputStyle,
} from "discord.js";
import { ModalBuilder, TextInputBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const getCustombots = await client.custombots.findCustomBots(
		interaction.user.id,
	);

	const getUser = await client.prisma.users.findUnique({
		where: {
			userId: interaction.user.id,
		},
	});

	if (getCustombots.length >= 2) {
		if (getUser?.type === "premium" && getCustombots.length >= 5) {
			return interaction.reply(client.i18n.t("CUSTOMBOT_LIMIT_REACHED"));
		}
	}

	const modal = new ModalBuilder(client, interaction.locale)
		.setCustomId("customBotCreate")
		.setTitle("CUSTOMBOT_CREATE");

	const token = new TextInputBuilder(client, interaction.locale)
		.setCustomId("token")
		.setLabel("CUSTOMBOT_TOKEN")
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const activity = new TextInputBuilder(client, interaction.locale)
		.setCustomId("activity")
		.setLabel("CUSTOMBOT_ACTIVITY")
		.setStyle(TextInputStyle.Short)
		.setRequired(false)
		.setMaxLength(128);

	const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
		token,
	);

	const actionRow2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
		activity,
	);

	modal.addComponents(actionRow, actionRow2);

	await interaction.showModal(modal);
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("create")
	.setDescription("Create custombot");
