import { config } from "dotenv";

config();

export default async function messageCreate(client, message) {
  const getWhitelist = await client.prisma.whitelist.findMany({
    where: {
      guildId: message.guild.id,
    },
  });
  const getCurrentSettings = await client.prisma.settings.findMany({
    where: {
      guildId: message.guild.id,
    },
  });

  if (getWhitelist[0].whitelisted) {
    if (
      message.channel.id === getCurrentSettings[0]?.aiChannel &&
      !message.author.bot
    ) {
      if (message.content.startsWith("//")) return;
      await message.channel.sendTyping();
      try {
        async function query(data) {
          const response = await fetch(
            "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
            {
              headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
              method: "POST",
              body: JSON.stringify(data),
            },
          );
          const result = await response.json();
          return result;
        }

        query({
          inputs: {
            text: message.content,
            past_user_inputs: [await getLastMessages(10)],
          },
        }).then(async (response) => {
          message.reply(response.generated_text);
        });
      } catch (error) {
        console.error("Error generating text:", error);
      }
      async function getLastMessages(limit) {
        const messages = await message.channel.messages.fetch({ limit: limit });
        const messagesWithoutBot = messages.filter(
          (message) => !message.author.bot,
        );
        return messagesWithoutBot.map((m) => m.content);
      }
    }
  }
}
