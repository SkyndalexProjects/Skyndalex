import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default async function createEmbedPaginator(
  interactionOrMessage,
  generateEmbed,
  totalPages,
  timeout = 300000,
  startIndex = 0,
) {
  let interactionAuthorId;
  let channel;

  if ("user" in interactionOrMessage) {
    // Interaction
    interactionAuthorId = interactionOrMessage.user.id;
    channel = interactionOrMessage.channel;
  } else {
    // Message
    interactionAuthorId = interactionOrMessage.author.id;
    channel = interactionOrMessage.channel;
  }

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

  const sentMessage = await channel.send({
    embeds: [await generateEmbed(currentIndex)],
    components: [row],
    fetchReply: true,
  });

  const collector = channel?.createMessageComponentCollector({
    time: timeout,
    filter: (interaction) => interactionAuthorId === interaction.user.id,
  });

  if (!collector) return;

  collector.on("collect", async (interaction) => {
    try {
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

      await interaction.deferUpdate();

      await sentMessage.edit({
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
    } catch (error) {
      console.error(error);
    }
  });

  collector.on("end", () => {
    row.components.forEach((component) => {
      sentMessage.edit({ components: [row] });
      component.setDisabled(true);
    });
  });
}
