import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
const cooldowns = new Map();

export default {
  data: new SlashCommandBuilder().setName("work").setDescription("Work"),

  async execute(client, interaction) {
    const money = Math.floor(Math.random() * (1000 + 1));
    const actions = ["Win", "Lose"];
    const action = actions[Math.floor(Math.random() * actions.length)];

    const user = await client.prisma.economy.findFirst({
      where: { uid: interaction.user.id },
    });

    // TODO: make customizable cooldown settings
    await client.cooldowns.set(interaction, 6000, interaction.user.id);

    if (action === "Win") {
      const win = await client.sentences.getRandomSentences(
        interaction,
        "win",
        money,
      );
      await client.economyBalance.updateWallet(
        interaction,
        interaction.user.id,
        +money,
      );
      const embedSuccess = new EmbedBuilder()
        .setDescription(`${win}`)
        .setColor("DarkGreen");
      await interaction.reply({ embeds: [embedSuccess] }).catch(() => null);
    } else {
      const lose = await client.sentences.getRandomSentences(
        interaction,
        "lose",
        money,
      );

      await client.economyBalance.updateWallet(
        interaction,
        interaction.user.id,
        -money,
      );
      const embedFail = new EmbedBuilder()
        .setDescription(`${lose}`)
        .setColor("DarkRed");
      await interaction.reply({ embeds: [embedFail] }).catch(() => null);
    }
  },
};
