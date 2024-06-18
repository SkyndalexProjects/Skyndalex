import type { SkyndalexClient } from "#classes";
import type { MessageComponentInteraction } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction<'cached'>,
) {
    const [ticketId, userId] = interaction.customId.split("-").slice(1);
    
    await client.tickets.delete(
        interaction.guild.id,
        Number.parseInt(ticketId),
        interaction.channel.id,
        userId,
    )
}
