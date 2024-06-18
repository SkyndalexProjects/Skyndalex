import type { SkyndalexClient } from "#classes";
import { EmbedBuilder, ButtonBuilder } from "#builders";
import { ActionRowBuilder, ButtonStyle,type MessageComponentInteraction } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction<'cached'>,
) {
    const [ticketId, userId, ticketCategory] = interaction.customId.split("-").slice(1);

    
    const ticket = await client.tickets.reopen(
        interaction.guild.id,
        userId,
        Number.parseInt(ticketId),
    )

    const embed = new EmbedBuilder(client, interaction.locale)
        .setTitle("TICKET_CREATED_TITLE")
        .setDescription("TICKET_CREATED_DESCRIPTION", {
            user: interaction.user.username,
            category: interaction.channel?.name,
            state: "open",
            id: ticketId,
        })
        .setColor("Green")

        // @ts-expect-error
        
        await interaction.channel.setParent(ticketCategory)

        const actions = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder(client, interaction.locale)
				.setCustomId(
					`archiveTicket-${ticket.id}-${interaction.user.id}`,
				)
				.setLabel("CLOSE_TICKET")
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder(client, interaction.locale)
				.setCustomId(`deleteTicket-${ticket.id}-${interaction.user.id}`)
				.setLabel("DELETE_TICKET")
				.setStyle(ButtonStyle.Secondary),
		);

    await interaction.update({
        embeds: [embed],
        components: [actions],
    })
}
