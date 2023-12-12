import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import createEmbedPaginator from "../../functions/createEmbedPaginator.js";
export default {
  data: new SlashCommandBuilder()
    .setName("updates")
    .setDescription("List all announcements."),

  async execute(client, interaction) {
    let messagesArray = [];
    const channel = client.channels.cache.get("1183142476270276819");
    channel.messages.fetch({ limit: 100 });
    const messages = await channel.messages.fetch({ limit: 100 });

    messages.forEach((message) => {
      messagesArray.push({
        id: message.id,
        content: message.content,
        author: message.author.username,
        highestRole: message.member.roles.highest.name,
      });
    });

    const totalPages = messagesArray.length;
    const items = messagesArray.filter((row) => row.id);

    const generateEmbed = async (page) => {
      const msgs = items[page];
      const embed = new EmbedBuilder()
        .setTitle(
          `Announcement ${page + 1} of ${items.length} by ${msgs.author}`,
        )
        .setDescription(`${msgs.highestRole}\n\n*${msgs.content}*`)
        .setColor("DarkButNotBlack")
        .setFooter({
          text: `Those messages are from our Discord server. Join! https://discord.gg/BknGx3NuHJ`,
        })
        .setTimestamp();

      return embed;
    };
    await createEmbedPaginator(interaction, generateEmbed, totalPages);
  },
};
