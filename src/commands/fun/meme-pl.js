import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

export default {
  data: new SlashCommandBuilder()
    .setName("meme-pl")
    .setDescription("Generate random polish meme.")
    .setNSFW(true),

  execute(client, interaction) {
    const memeSubreddits = ["polskiememy", "Polska", "PolskieMemyReborn"];
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

        const embed = new EmbedBuilder()
          .setTitle(`\`r/${post.subreddit}:\` ${post.title}`)
          .setURL(post.url)
          .setImage(post.url)
          .setAuthor({ name: `u/${post.author}`, iconURL: `${post.url}` })
          .setFooter({ text: `👍 ${post.ups} | 💬 ${post.num_comments}` })
          .setColor("#3498db");

        await interaction.reply({ embeds: [embed] });
      });
  },
};
