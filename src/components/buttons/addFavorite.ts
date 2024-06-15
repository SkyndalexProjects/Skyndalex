import type { SkyndalexClient } from "#classes";
import { ButtonBuilder } from "#builders";
import { ActionRowBuilder, type MessageComponentInteraction, ButtonStyle } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
    try {
        const value = interaction.customId.split("-")[1];
        const name = interaction.message.embeds[0].description.split(":")[1].replaceAll("**", "").trim().split("\n")[0];

        const add = await client.prisma.favourties.upsert({
            where: {
                userId: interaction.user.id,
                id: 0
            },
            create: {
                userId: interaction.user.id,
                radioId: value,
                radioName: name
            },
            update: {
                radioId: value,
                radioName: name
            },
        })
    
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder(client, interaction.locale)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
                .setLabel("RADIO_FAVORITE_ADDED")
                .setCustomId("addedRadio"),
        )
    
        if (add) {
            return interaction.update({
                components: [row],
            })
        }
    } catch (e) {
        console.error(e)
        return interaction.reply({ content: "An error occurred while adding", ephemeral: true })
    }
}
