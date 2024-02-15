import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
export default {
  data: new SlashCommandBuilder().setName("cat").setDescription("Random cat"),

  execute(client, interaction) {
    fetch("https://www.reddit.com/r/cats.json?limit=10000")
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
          post.url.endsWith(".jpeg")
        )
          embed.setImage(post.url);
        await interaction.reply({ embeds: [embed] });
      });
  },
};
