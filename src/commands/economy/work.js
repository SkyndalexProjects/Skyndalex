import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
export default {
  data: new SlashCommandBuilder().setName("work").setDescription("Work"),
  // TODO: add cooldown property and refactor to events

  async execute(client, interaction) {
    const money = Math.floor(Math.random() * (1000 + 1));
    const actions = ["Win", "Lose"];
    const action = actions[Math.floor(Math.random() * actions.length)];

    const user = await client.prisma.economy.findFirst({
      where: { uid: interaction.user.id },
    });

   const cooldown =  await client.cooldowns.set(interaction.commandName, interaction.guild.id, 6, interaction.user.id);

   const embedCooldown = new EmbedBuilder()
     .setDescription(`⏰ | You need to wait ${Math.ceil(cooldown)}s before using this command again.`)
     .setColor("Yellow");

   if (cooldown) return interaction.reply({ embeds: [embedCooldown], ephemeral: true })

    if (action === "Win") {
      const win = await client.sentences.getRandomSentences(
        interaction,
        "win",
        money,
      );

      if (!win) return;

      await client.economyBalance.updateWallet(
        interaction,
        interaction.user.id,
        +money,
      );
      const embedSuccess = new EmbedBuilder()
        .setDescription(`${win}`)
        .setColor("DarkGreen");
      await interaction?.reply({ embeds: [embedSuccess] }).catch(() => null)
    } else {
      const lose = await client.sentences.getRandomSentences(
        interaction,
        "lose",
        money,
      );

      if (!lose) return;

      await client.economyBalance.updateWallet(
        interaction,
        interaction.user.id,
        -money,
      );
      const embedFail = new EmbedBuilder()
        .setDescription(`${lose}`)
        .setColor("DarkRed");
      await interaction?.reply({ embeds: [embedFail] }).catch(() => null)
    }
  },
};
