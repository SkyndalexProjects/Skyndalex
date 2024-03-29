import { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } from "discord.js";
import fetch from "node-fetch";


  export async function run(client, interaction) {
    // const update = await client.economyBalance.updateWallet(client, interaction, interaction.user, +1);

    console.log("działa")
    const update = await client.economyBalance.updateWallet(interaction, interaction.user.id, 1);
    console.log("update", update);

  }

export const data =  new SlashCommandBuilder().setName("test").setDescription("test")