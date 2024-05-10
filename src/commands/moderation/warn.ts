import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
    PermissionFlagsBits,
    ButtonStyle,
    ActionRowBuilder,
} from "discord.js";
import { ButtonBuilder } from "classes/builders/components/ButtonBuilder";
import type { SkyndalexClient } from "../../classes/Client";
import { EmbedBuilder } from "classes/builders/EmbedBuilder";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const member = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason");

    const newCase = await client.prisma.cases.create({
        data: {
            guildId: interaction.guild.id,
            userId: member.user.id,
            type: "warn",
            moderator: interaction.user.id,
            reason: reason,
        }
    });

    const deleteButton = new ButtonBuilder(client, interaction.locale)
        .setCustomId(`deleteCase-${newCase.id}-${member.user.id}-warn`)
        .setLabel("DELETE_CASE_BUTTON")
        .setStyle(ButtonStyle.Danger)

    const row = new ActionRowBuilder().addComponents(deleteButton)
    
    const embed = new EmbedBuilder(client, interaction.locale)
    .setTitle("ADD_WARN_TITLE")
    .setColor("Yellow")
    .addFields([
        {
            name: "ADD_WARN_WARNED_USER",
            value: member.toString(),
        },
        {
            name: "ADD_WARN_REASON",
            value: reason,
        },
    ])

    return await interaction.reply({ embeds: [embed], components: [row] });
}
export const data = new SlashCommandBuilder()
	.setName("warn")
	.setDescription("Warn user")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("The user to warn.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("reason")
            .setDescription("The reason for the warn.")
            .setRequired(false)
    )