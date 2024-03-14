import { EmbedBuilder } from "discord.js";
import createPlayer from "../../../functions/player.js";
export default {
  customId: "play",
  type: "button",

  run: async (client, interaction) => {
    await interaction.deferReply();

    const sound_url =
      interaction.message.embeds[0]?.data?.description?.split("from ")[1] ||
      interaction.message.embeds[0]?.data?.footer?.text ||
      interaction.message.embeds[0]?.data?.url;

    // console.log("interaction.message.embeds", interaction.message.embeds[0])
    // console.log("sound_url", sound_url);
    const url = new URL(sound_url);

    const memberChannel = interaction.member.voice.channel;

    if (!memberChannel) {
      return await interaction.editReply(
        `Hey, ${interaction.user.tag}! You must be in a voice channel to use "Play again" button.`,
      );
    }

    const res = await fetch(`https://co.wuk.sh/api/json`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: encodeURI(sound_url),
      }),
    });

    const json = await res.json();

    const embedError = new EmbedBuilder()
      .setTitle("❌ Error")
      .setDescription(
        `Error while fetching ${url.hostname} sound from ${sound_url}.\n\n**Error title:**\n\`${json.text}\``,
      )
      .setColor("Red");

    if (json.status === "error") {
      return interaction.editReply({ embeds: [embedError] });
    }

    const resourceUrl = json.url || json.audio;

    await createPlayer(
      client,
      interaction,
      resourceUrl,
      memberChannel.guild.id,
      memberChannel.id,
      sound_url,
      url.hostname,
    );
  },
};
