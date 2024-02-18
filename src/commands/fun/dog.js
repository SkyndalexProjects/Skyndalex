import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
export default {
  data: new SlashCommandBuilder().setName("dog").setDescription("Random dog"),

  async execute(client, interaction) {
    const response = await fetch(
      "https://www.reddit.com/r/dog.json?limit=10000",
    );
    const json = await response.json();

    let post =
      json.data.children[Math.floor(Math.random() * json.data.children.length)]
        .data;

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
  },
};
