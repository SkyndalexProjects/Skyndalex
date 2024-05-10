import type { SkyndalexClient } from "classes/Client";
import { ActionRowBuilder, ButtonStyle, type MessageComponentInteraction } from "discord.js";
import { ButtonBuilder } from "classes/builders/components/ButtonBuilder";
export async function run(
    client: SkyndalexClient,
    interaction: MessageComponentInteraction,
) {
    const caseId = interaction.customId.split("-")[1];
    const memberId = interaction.customId.split("-")[2];
    const caseType = interaction.customId.split("-")[3];

    await client.prisma.cases.delete({
        where: {
            id: Number.parseInt(caseId),
        }
    })

    const disableButton = new ButtonBuilder(client, interaction.locale)
    .setCustomId("disabled-button")
    .setDisabled(true)
    .setLabel("CASE_REVOKED")
    .setStyle(ButtonStyle.Secondary)

    const row = new ActionRowBuilder().addComponents(disableButton)
    switch (caseType) {
        case "timeout":
            const member = await interaction.guild.members.fetch(memberId);
            await member.timeout(null, "Revoked");
            break;
    }
    await interaction.update({ components: [row] })
}
