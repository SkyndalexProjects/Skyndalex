import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
export default {
  data: new SlashCommandBuilder().setName("slut").setDescription("Slut"),

  async execute(client, interaction) {
    const money = Math.floor(Math.random() * (1000 + 1));
    const actions = ["Win", "Lose"];
    const action = actions[Math.floor(Math.random() * actions.length)];

    // TODO: add cooldown, set .catch() => null

    if (action === "Win") {
      const win = await client.sentences.getRandomSentences(
        interaction,
        "win",
        money,
      );
      console.log("win", win);
      await client.economyBalance.updateWallet(
        interaction,
        interaction.user.id,
        +money,
      );
      const embedSuccess = new EmbedBuilder()
        .setDescription(`${win}`)
        .setColor("DarkGreen");
      await interaction.reply({ embeds: [embedSuccess] });
    } else {
      const lose = await client.sentences.getRandomSentences(
        interaction,
        "lose",
        money,
      );
      console.log("lose", lose);

      await client.economyBalance.updateWallet(
        interaction,
        interaction.user.id,
        -money,
      );
      const embedFail = new EmbedBuilder()
        .setDescription(`${lose}`)
        .setColor("DarkRed");
      await interaction.reply({ embeds: [embedFail] });
    }
  },
};
