import type { SkyndalexClient } from "../../classes/Client";
import {type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder} from 'discord.js';

export async function run(client: SkyndalexClient, interaction: ChatInputCommandInteraction) {
    console.log("interaction locale", interaction.locale)
    const locales = {
        pl: "Dupa!",
        de: "Arsch!"
    }
    await interaction.reply(locales[interaction.locale])
}
export const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!");