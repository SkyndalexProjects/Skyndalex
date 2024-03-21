import { SlashCommandBuilder } from "discord.js";

export default {
  data: {
    ...new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Ping")
      .setDMPermission(true),
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },

  async execute(client, interaction) {
    console.log("chuj");

    await interaction.reply({
      content: `Ping: \`${client.ws.ping}\``,
    });
  },
};
