import type { SkyndalexClient } from "#classes";
import { ButtonBuilder } from "#builders";
import {
    ActionRowBuilder,
	 ButtonStyle,
	 type MessageComponentInteraction,
} from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction<"cached">,
) {
    const [label, customId] = interaction.customId.split("-").slice(1)

    console.log("label", label, "customId", customId)
    await client.prisma.ticketButtons.deleteMany({
        where: {
            guildId: interaction.guild.id,
            label,
            customId: Number.parseInt(customId),
        },
    })

    const deletedButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder(client, interaction.locale)
            .setCustomId(`deletedButton-${customId}`)
            .setLabel("DELETED_BUTTON")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
    );

    return interaction.update({ components: [deletedButton] })
}
