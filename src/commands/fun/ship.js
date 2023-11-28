import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
export default {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Ship.")
    .addUserOption((option) =>
      option.setName("user1").setDescription("User 1").setRequired(true),
    )
    .addUserOption((option) =>
      option.setName("user2").setDescription("User 2").setRequired(true),
    ),

  async execute(client, interaction) {
    await interaction.deferReply();
    const random = Math.floor(Math.random() * 100);

    if (
      interaction.options.getUser("user1") ===
      interaction.options.getUser("user2")
    )
      return interaction.editReply("Really?");

    const embed = new EmbedBuilder()
      .setTitle(`❤️ | Test`)
      .setDescription(
        `${interaction.options.getUser(
          "user1",
        )} and ${interaction.options.getUser(
          "user2",
        )} are ${random}% compatible!`,
      )
      .setColor("#ff0621");
    await interaction.editReply({ embeds: [embed] });
  },
};
