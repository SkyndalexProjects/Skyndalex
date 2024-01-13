import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Change song volume.")
    .addIntegerOption((option) =>
      option
        .setName("volume")
        .setDescription("Change volume")
        .setRequired(true)
        .setMaxValue(100)
        .setMinValue(1),
    ),

  async execute(client, interaction) {
    await interaction.deferReply();

    const node = client.shoukaku.getNode();
    if (!node) return;

    const volume = interaction.options.getInteger("volume");
    const currentPlayer = await node.players.get(interaction.guild.id);
    await currentPlayer.setVolume(volume);

    await interaction.editReply(`🔊 Volume set to ${volume}%`);
  },
};
