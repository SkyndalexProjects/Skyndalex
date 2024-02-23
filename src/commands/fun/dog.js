import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
export default {
  data: new SlashCommandBuilder().setName("dog").setDescription("Random dog"),

  async execute(client, interaction) {
    const response = await fetch(
      "https://api.thedogapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=1",
    );
    const json = await response.json();

    console.log("json", json[0].url)
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setImage(json[0].url)
      .setFooter({ text: "Powered by thedogapi.com" });

    await interaction.reply({ embeds: [embed] });
  },
};
