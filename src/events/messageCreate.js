import { AttachmentBuilder } from "discord.js";
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
        if (message.content.startsWith("--genimg")) {
          async function query(data) {
            const response = await fetch(
              "https://api-inference.huggingface.co/models/openskyml/dalle-3-xl",
              {
                headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
                method: "POST",
                body: JSON.stringify(data),
              },
            );
            const result = await response.blob();
            return result;
          }

          try {
            const response = await query({ inputs: message.content });
            console.log(response);

            const imageBuffer = await response.arrayBuffer();
            const image = new AttachmentBuilder(
              Buffer.from(imageBuffer),
              "image.png",
            );

            await message.reply({ files: [image] });
          } catch (error) {
            console.error("Error:", error);
          }
        } else {
          const result = await textGen(message.content);
          const response = result.generated_text;
          await message.reply(response);
        }
      } catch (error) {
        console.error("Error while generating:", error);
      }

      async function getLastMessages(limit) {
        const messages = await message.channel.messages.fetch({ limit: limit });
        const messagesWithoutBot = messages.filter(
          (message) => !message.author.bot,
        );
        return messagesWithoutBot.map((m) => m.content);
      }

      async function textGen(input) {
        const response = await fetch(
          "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
          {
            headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
            method: "POST",
            body: JSON.stringify({
              inputs: {
                text: input,
                past_user_inputs: [await getLastMessages(10)],
              },
            }),
          },
        );
        return await response.json();
      }
    }
  }
}
