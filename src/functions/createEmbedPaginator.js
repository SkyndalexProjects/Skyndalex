import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default async function createEmbedPaginator(
  interaction,
  generateEmbed,
  totalPages,
  timeout = 300000,
  startIndex = 0,
) {
  const interactionAuthorId = interaction.user.id;
  // todo: rewrite this

  let currentIndex = startIndex;
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`previous-${currentIndex}`)
      .setLabel("Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentIndex === 0),
    new ButtonBuilder()
      .setCustomId(`next-${currentIndex}`)
      .setLabel("Next")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(currentIndex === totalPages - 1),
  );

  const collector = interaction.channel?.createMessageComponentCollector({
    time: timeout,
    filter: (interaction) => interactionAuthorId === interaction.user.id,
  });

  if (!collector) return;
  collector.on("collect", async (interaction) => {
    if (interactionAuthorId !== interaction.user.id) return;

    const [type, index] = interaction.customId.split("-");
    if (index !== String(currentIndex)) return;
    switch (type) {
      case "previous":
        currentIndex -= 1;
        break;
      case "next":
        currentIndex += 1;
        break;
      default:
        break;
    }
    if (currentIndex < 0) {
      currentIndex = totalPages - 1;
    } else if (currentIndex >= totalPages) {
      currentIndex = 0;
    }
    await interaction.update({
      embeds: [await generateEmbed(currentIndex)],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`previous-${currentIndex}`)
            .setLabel("Previous")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentIndex === 0),
          new ButtonBuilder()
            .setCustomId(`next-${currentIndex}`)
            .setLabel("Next")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(currentIndex === totalPages - 1),
        ),
      ],
    });
  });
  collector.on("end", () => {
    row.components.forEach((component) => {
      component.setDisabled(true);
    });
    interaction.editReply({ components: [row] });
  });
  await interaction.reply({
    embeds: [await generateEmbed(currentIndex)],
    components: [row],
    fetchReply: true,
  });
}
