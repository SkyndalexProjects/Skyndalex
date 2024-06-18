import type { SkyndalexClient } from "#classes";
import { EmbedBuilder, ButtonBuilder } from "#builders";
import { ActionRowBuilder, ButtonStyle,PermissionFlagsBits,type MessageComponentInteraction } from "discord.js";

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

    const ticket = await client.tickets.archive(
        interaction.guild.id,
        userId,
        Number.parseInt(ticketId),
    )

    const reopen = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder(client, interaction.locale)
            .setCustomId(`reopenTicket-${ticketId}-${userId}-${ticket.ticketCategory}`)
            .setLabel("TICKET_REOPEN")
            .setStyle(ButtonStyle.Primary)
    );

    const embed = new EmbedBuilder(client, interaction.locale)
        .setTitle("TICKET_CREATED_TITLE")
        .setDescription("TICKET_CREATED_DESCRIPTION", {
            user: interaction.user.username,
            category: interaction.channel?.name,
            state: "closed",
            id: ticketId,
        })
        .setColor("Green")
    
    await interaction.update({
        embeds: [embed],
        components: [reopen],
    })

    const settings = await client.prisma.settings.findFirst({
        where: {
            guildId: interaction.guild.id,
        },
    });

    console.log("settings", settings)

    // @ts-expect-error
    await interaction.channel?.setParent(settings?.ticketArchiveCategory)
}
