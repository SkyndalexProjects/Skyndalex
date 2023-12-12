import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("text")
    .setDescription("Manage your economy commands text")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set your economy commands text")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Command type")
            .setRequired(true)
            .addChoices(
              { name: "Work", value: "work" },
              { name: "Crime", value: "crime" },
              { name: "Slut", value: "slut" },
            ),
        )
        .addStringOption((option) =>
          option
            .setName("text")
            .setDescription("Sentence to add")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Action (Win/Lose)")
            .setRequired(true)
            .addChoices(
              { name: "Win", value: "win" },
              { name: "Lose", value: "lose" },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("update")
        .setDescription("Update your economy commands text")
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("ID of the sentence to update")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("text")
            .setDescription("New sentence")
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("New action (Win/Lose)")
            .setRequired(true)
            .addChoices(
              { name: "Win", value: "win" },
              { name: "Lose", value: "lose" },
            ),
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Command type")
            .setRequired(true)
            .addChoices(
              { name: "Work", value: "work" },
              { name: "Crime", value: "crime" },
              { name: "Slut", value: "slut" },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete your economy commands text")
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("ID of the sentence to delete")
            .setRequired(true),
        ),
    ),

  async execute(client, interaction) {
    const type = interaction.options.getString("type");
    const sentence = interaction.options.getString("text");
    const action = interaction.options.getString("action");

    const handleReply = (message) => {
      const embed = new EmbedBuilder()
        .setTitle(message)
        .addFields([
          {
            name: "Type",
            value: String(type),
            inline: true,
          },
          {
            name: "Sentence",
            value: String(sentence) || "Deleted. ",
            inline: true,
          },
          {
            name: "Action",
            value: String(action),
            inline: true,
          },
        ])
        .setColor("Green");
      interaction.reply({ embeds: [embed] });
    };

    const [row] = await client.prisma.economySettings.findMany({
      where: {
        guildId: interaction.guild.id,
      },
      orderBy: {
        id: "desc",
      },
      take: 1,
    });
    const createSentence = async (sentence, action) => {
      await client.prisma.economySettings.create({
        data: {
          id: row?.id + 1 || 0,
          guildId: interaction.guild.id,
          sentence: sentence,
          type: type,
          action: action,
        },
      });
      handleReply("Sentence created!");
    };

    try {
      const updateSentence = async (id, newText, newAction) => {
        const update = await client.prisma.economySettings.update({
          where: { id_guildId: { id: id, guildId: interaction.guild.id } },
          data: { sentence: newText, action: newAction, type: type },
        });
        if (!update)
          return interaction.reply({ content: "Sentence not found!" });
        handleReply("Sentence updated!");
      };

      const deleteSentence = async (id) => {
        await client.prisma.economySettings.delete({
          where: { id_guildId: { id: id, guildId: interaction.guild.id } },
        });
        handleReply("Sentence deleted!");
      };

      const id = interaction.options.getInteger("id");

      switch (interaction.options.getSubcommand()) {
        case "set":
          await createSentence(sentence, action);
          break;
        case "update":
          await updateSentence(id, sentence, action);
          break;
        case "delete":
          await deleteSentence(id);
          break;
      }
    } catch (e) {
      return interaction.reply({
        content: `Operation failed. Check your arguments.`,
      });
    }
  },
};
