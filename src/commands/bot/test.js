import { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder().setName("test").setDescription("test"),

  async execute(client, interaction) {
    // const update = await client.economyBalance.updateWallet(client, interaction, interaction.user, +1);

    console.log("działa")
    const update = await client.economyBalance.updateWallet(interaction, interaction.user.id, 1);
    console.log("update", update);
  },
};
