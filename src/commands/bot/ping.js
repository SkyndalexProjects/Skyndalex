import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("ping").setDescription("Bot ping"),

  async execute(client, interaction) {
    const confirm = new ButtonBuilder()
      .setCustomId("gay")
      .setLabel("I'm gay [MODAL]")
      .setStyle(ButtonStyle.Danger);

    const cancel = new ButtonBuilder()
      .setCustomId("lesbian")
      .setLabel("I'm lesbian")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(cancel, confirm);

    await interaction.reply({
      content: `Ping: \`${client.ws.ping}\``,
      components: [row],
    });
  },
};
