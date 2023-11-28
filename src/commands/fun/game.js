import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import Gamedig from "gamedig";

export default {
  data: new SlashCommandBuilder()
    .setName("game")
    .setDescription("Search game server")
    .addStringOption((option) =>
      option.setName("game").setDescription("Game name").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("server").setDescription("Server IP").setRequired(true),
    ),

  execute(client, interaction) {
    Gamedig.query({
      type: interaction.options.getString("game"),
      host: interaction.options.getString("server"),
    }).then(async (state) => {
      console.log(state);

      const embed = new EmbedBuilder()
        .setTitle(
          `${state.name} : \`${state.raw.vanilla.connect}\` | Ping: ${state.raw.vanilla.ping}ms`,
        )
        .addFields(
          {
            name: "Map",
            value: `${state.raw.vanilla.map || "None"}`,
            inline: true,
          },
          { name: "Ping", value: `${state.raw.vanilla.ping}`, inline: true },
          {
            name: "Password protected?",
            value: `${state.raw.vanilla.password}`,
            inline: true,
          },
        )
        .setColor("Blurple");

      if (state.players.length > 0) {
        embed.addFields({
          name: "Players",
          value: `${state.players.length}/${state.maxplayers}`,
          inline: true,
        });
      }

      await interaction.reply({ embeds: [embed] });
    });
  },
};
