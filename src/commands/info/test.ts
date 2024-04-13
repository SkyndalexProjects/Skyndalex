import type { SkyndalexClient } from "../../classes/Client";
import {type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder} from 'discord.js';

export async function run(client: SkyndalexClient, interaction: ChatInputCommandInteraction) {
    console.log("interaction locale", interaction.locale)
    const locales = {
        pl: "hej to działa",
        de: "hey im working"
    }
    await interaction.reply(locales[interaction.locale])
}
export const data = new SlashCommandBuilder()
    .setName("test")
    .setDescription("test");