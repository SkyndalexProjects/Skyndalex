import type { SkyndalexClient } from "#classes";
import { type MessageComponentInteraction, PermissionFlagsBits } from "discord.js";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction<'cached'>,
) {
    const [ticketId, userId] = interaction.customId.split("-").slice(1);
    if (interaction.user.id !== userId && !interaction.member?.permissions.has(PermissionFlagsBits.ManageChannels))
        return interaction.reply({
            content: client.i18n.t("CANNOT_USE_BUTTON"),
            ephemeral: true,
        });

    await client.tickets.delete(
        interaction.guild.id,
        Number.parseInt(ticketId),
        interaction.channel.id,
        userId,
    )
}
