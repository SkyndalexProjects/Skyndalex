import type { SkyndalexClient } from "#classes";
import { EmbedBuilder, ButtonBuilder } from "#builders";
import {
	type StringSelectMenuInteraction,
	ActionRowBuilder,
	ButtonStyle,
} from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: StringSelectMenuInteraction<"cached">,
) {
	const value = interaction.values[0];

	const customBot = await client.prisma.custombots.findUnique({
		where: {
			id_userId: {
				id: Number.parseInt(value),
				userId: interaction.user.id,
			},
		},
	});

	if (!customBot) {
		return await interaction.reply({
			content: "Custom bot not found",
			ephemeral: true,
		});
	}

	const customBotDiscord = await client.users.fetch(customBot.clientId);

	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CUSTOM_BOT_MANAGE_TITLE")
		.setDescription("CUSTOM_BOT_CURRENT_DESC", {
			currentBot: customBotDiscord.username,
			status: customBot.status,
			botId: customBot.id,
			activity: customBot.activity,
		})
		.setColor("DarkAqua");

	const updatePowerState = new ButtonBuilder(client, interaction.locale)
		.setCustomId(`customBotPowerState-${customBot.id}`)
		.setLabel("CUSTOM_BOT_POWER_STATE_ON")
		.setStyle(ButtonStyle.Success);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		updatePowerState,
	);

	await interaction.update({
		embeds: [embed],
		components: [interaction.message.components[0], row],
	});
}
