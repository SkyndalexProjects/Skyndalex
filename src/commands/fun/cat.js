import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
export default {
  data: new SlashCommandBuilder().setName("cat").setDescription("Random cat"),

  async execute(client, interaction) {
    const response = await fetch(
      "https://www.reddit.com/r/cats.json?raw_json=1",
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    // console.log("response", response)
    const json = await response.json();
    const imagePosts = json.data.children.filter(
      (post) =>
        post.data.url.match(/\.(jpeg|jpg|gif|png)$/i) && post.data.preview,
    );

    const randomIndex = Math.floor(Math.random() * imagePosts.length);
    const post = imagePosts[randomIndex].data;

    console.log(post);

    console.log(post.preview);
    // console.log(post.preview.images[0].source.url)
    console.log(post);

    const embed = new EmbedBuilder()
      .setTitle(`\`r/${post.subreddit}:\` ${post.title}`)
      .setURL(post.url)
      .setColor("#3498db");
    embed.setImage(post.preview.images[0].source.url);
    await interaction.reply({ embeds: [embed] });
  },
};
