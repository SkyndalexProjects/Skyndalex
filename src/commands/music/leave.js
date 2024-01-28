import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave current voice channel."),

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

    node.leaveChannel(interaction.guild.id);
    await interaction.editReply(`👋 I left channel!`);
  },
};
