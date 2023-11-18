import { TiktokDL } from "@tobyg74/tiktok-api-dl";
import {
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  joinVoiceChannel,
} from "@discordjs/voice";

export default {
  customId: "play_again",
  type: "button",

  run: async (client, interaction) => {
    const url = interaction.customId.split("=")[1];

    const memberChannel = interaction.member.voice.channel;

    if (!memberChannel) {
      return await interaction.reply(
        `Hey, ${interaction.user.tag}! You must be in a voice channel to use "Play again" button.`,
      );
    }

    try {
      const response = await fetch(url);
      const audio = response.body;

      const resource = await createAudioResource(audio, {
        inlineVolume: true,
      });

      const player = createAudioPlayer();

      player.on("idle", async () => {
        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
          connection.destroy();
        }

        await interaction.editReply(" ✅ Ended playing again.");
      });

      const newConnection = await joinVoiceChannel({
        channelId: memberChannel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
      newConnection.subscribe(player);
      player.play(resource);

      await interaction.reply(`🎶 Playing again! 🎶`);
    } catch (e) {
      await interaction.reply(
        "❌ | I can't play again this. :|\n(You probably provided URL to video, not a song.)",
      );
    }
  },
};
