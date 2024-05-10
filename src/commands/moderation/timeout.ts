import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
    PermissionFlagsBits,
} from "discord.js";
import type { SkyndalexClient } from "../../classes/Client";
import { EmbedBuilder } from "classes/builders/EmbedBuilder";
import ms from "ms"
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const member = interaction.options.getMember("user");
    const time = interaction.options.getString("time");
    const reason = interaction.options.getString("reason");

    console.log("member", member)
    const newCase = await client.prisma.cases.create({
        data: {
            guildId: interaction.guild.id,
            userId: member.user.id,
            type: "timeout",
            reason: reason,
            moderator: interaction.user.id,
            duration: time,
        }
    });
    console.log(newCase);
    const convertedTime = await ms(time);
    
    await member.timeout(convertedTime, reason)

    const embed = new EmbedBuilder(client, interaction.locale)
    .setTitle("SET_TIMEOUT_TITLE")
    .setColor("Yellow")
    .addFields([
        {
            name: "SET_TIMEOUT_USER",
            value: member.toString(),
        },
        {
            name: "SET_TIMEOUT_REASON",
            value: reason,
        },
        {
            name: "SET_TIMEOUT_DURATION",
            value: time,
        }
    ])

    return await interaction.reply({ embeds: [embed] });
}
export const data = new SlashCommandBuilder()
	.setName("timeout")
	.setDescription("Timeout a user for a certain amount of time.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("The user to timeout.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("time")
            .setDescription("The amount of time to timeout the user for. (e.g 1d, 5m, 5mo, 5y)")
            .setRequired(true)
)
    .addStringOption((option) =>
        option
            .setName("reason")
            .setDescription("The reason for the timeout.")
            .setRequired(false)
    )