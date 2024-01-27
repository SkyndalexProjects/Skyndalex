import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop current song."),

  async execute(client, interaction) {
    await interaction.deferReply();

    const memberChannel = interaction.member.voice.channel;
    if (!memberChannel) {
      return await interaction.editReply(
        `Hey, ${interaction.user.tag}! You must be in a voice channel to use this command.`,
      );
    }
    const node = client.shoukaku.getNode();
    if (!node) return;

    const existingPlayer = node.players.has(interaction.guild.id);
    if (!existingPlayer)
      return interaction.editReply("❌ | I'm not playing anything.");

    const player = node.players.get(interaction.guild.id);

    await player.stopTrack()
    node.leaveChannel(interaction.guild.id);

    await interaction.editReply(`👋 I left channel!`);
  },
};
