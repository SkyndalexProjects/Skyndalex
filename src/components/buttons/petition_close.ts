import { ActionRowBuilder, ButtonStyle, type MessageComponentInteraction } from "discord.js";
import { ButtonBuilder } from "#builders";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction<"cached">,
) {
    const [customId, id, authorId] = interaction.customId.split("-");

    if (interaction.user.id !== authorId) {
        return interaction.reply({
            content: "PETITION_CLOSE_NOT_AUTHOR",
            ephemeral: true,
        });
    }
    
    await client.prisma.petitions.delete({
        where: {
            id: parseInt(id),
            author: authorId,
        },
    })

    await interaction.update({
        embeds: interaction.message.embeds,
        components: [],
    });
}
