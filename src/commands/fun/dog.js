import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
export default {
  data: new SlashCommandBuilder().setName("dog").setDescription("Random dog"),

  execute(client, interaction) {
    fetch("https://www.reddit.com/r/dogpictures.json?limit=10000")
      .then((res) => res.json())
      .then(async (json) => {
        let post =
          json.data.children[
            Math.floor(Math.random() * json.data.children.length)
          ].data;

        const embed = new EmbedBuilder()
          .setTitle(`\`r/${post.subreddit}:\` ${post.title}`)
          .setURL(post.url)
          .setColor("#3498db");

        if (
          post.url.endsWith(".jpg") ||
          post.url.endsWith(".png") ||
          post.url.endsWith(".gif") ||
          post.url.endsWith(".jpeg")
        )
          embed.setImage(post.url);
        await interaction.reply({ embeds: [embed] });
      });
  },
};
