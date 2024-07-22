import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
	TextInputStyle,
	ActionRowBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { ModalBuilder, TextInputBuilder } from "#classes/builders";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const getCustombots = await client.prisma.custombots.findMany({
		where: {
			userId: interaction.user.id,
		},
	});

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
		.setPlaceholder("CUSTOMBOT_TOKEN_PLACEHOLDER")
		.setStyle(TextInputStyle.Short)
		.setRequired(true);

	const activity = new TextInputBuilder(client, interaction.locale)
		.setCustomId("activity")
		.setLabel("CUSTOMBOT_ACTIVITY")
		.setPlaceholder("CUSTOMBOT_ACTIVITY_PLACEHOLDER")
		.setStyle(TextInputStyle.Short)
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
	.setDescription("Create custom bot");
