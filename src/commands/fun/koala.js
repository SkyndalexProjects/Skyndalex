import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder()
    .setName("koala")
    .setDescription("Generate random koala (not always.)")
    .setNSFW(true),

  async execute(client, interaction) {
    const memeSubreddits = ["koalas"];
    const subreddit =
      memeSubreddits[Math.floor(Math.random() * memeSubreddits.length)];

    fetch(`https://www.reddit.com/r/${subreddit}.json?limit=500`)
      .then((res) => res.json())
      .then(async (json) => {
        let post =
          json.data.children[
            Math.floor(Math.random() * json.data.children.length)
          ].data;
        console.log(post);

        const embed = new EmbedBuilder().setImage(post.url).setColor("#f55f07");

        await interaction.reply({ embeds: [embed] });
      });
  },
};
