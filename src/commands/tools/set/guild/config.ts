import {
	type ChatInputCommandInteraction,
	SlashCommandSubcommandBuilder,
    ActionRowBuilder
} from "discord.js";
import { EmbedBuilder } from "classes/builders/EmbedBuilder";
import { StringSelectMenuBuilder } from "classes/builders/components/StringSelectMenuBuilder";
import type { SkyndalexClient } from "../../../../classes/Client";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const availableSettings = await client.prisma.settings.findMany({
		where: {
			guildId: interaction.guild.id,
		},
	});

	const fields = Object.keys(availableSettings[0]).map((key, index) => {
		return {
			name: key,
			value: Object.values(availableSettings[0])[index] || client.i18n.t("CONFIG_NOT_SET", { lng: interaction.locale }),
            inline: true
		};
	});

    const select = new StringSelectMenuBuilder(client, interaction.locale)
    .setPlaceholder("CONFIG_GUILD_SELECT_PLACEHOLDER")
    .setCustomId("config")
    .addOptions(
        Object.keys(availableSettings[0]).map((key) => {
            return {
                label: key,
                value: key
            }
        })
    )

    const row = new ActionRowBuilder().addComponents(select)
	const embed = new EmbedBuilder(client, interaction.locale)
		.setTitle("CONFIG_GUILD_TITLE")
		.setColor("Blurple")
	    .setFields(fields)

	return interaction.reply({ embeds: [embed], components: [row] });
}
export const data = new SlashCommandSubcommandBuilder()
	.setName("config")
	.setDescription("Set guild configuration");
