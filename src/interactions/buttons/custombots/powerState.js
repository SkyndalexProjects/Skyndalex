import { execSync, fork } from "child_process";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import find from "find-process";
import { parseURLToResultingURLRecord } from "jsdom/lib/jsdom/living/helpers/document-base-url.js";
export default {
  customId: `customBotPowerState`,
  type: "button",

  run: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true })
    const deploy = new ButtonBuilder()
      .setLabel("Deploy bot commands")
      .setStyle(ButtonStyle.Primary)
      .setCustomId(`customBotDeploy-${interaction.user.id}`);

    const powerStateOff = new ButtonBuilder()
      .setLabel("Turn bot off")
      .setStyle(ButtonStyle.Danger)
      .setCustomId(`customBotPowerState-${interaction.user.id}`);

    const powerStateOn = new ButtonBuilder()
      .setLabel("Turn bot on")
      .setStyle(ButtonStyle.Success)
      .setCustomId(`customBotPowerState-${interaction.user.id}`);

    const turnOnactionRow = new ActionRowBuilder().addComponents(powerStateOff, deploy);
    const turnOffactionRow = new ActionRowBuilder().addComponents(powerStateOn, deploy);

    const bot = await find("name", `customBot ${interaction.user.id}`);

    const { token, clientId } = await client.prisma.customBots.findUnique({
      where: { userId: interaction.user.id },
    });

    await client.prisma.$executeRawUnsafe(`CREATE DATABASE customBot_${clientId};`).catch(() => null);
    const DBURL = `postgresql://postgres:${process.env.CUSTOMBOT_DB_PASSWORD}@localhost:5432/custombot_${clientId}?schema=public`

    execSync(
      `SET DATABASE_URL=${DBURL} && npx prisma db push && npx prisma db pull && npx prisma migrate deploy --schema ./prisma/schema.prisma`,
      { stdio: 'inherit' },
    );

    if (!bot) {
      await fork("customBot", [interaction.user.id], {
        env: {
          BOT_TOKEN: token,
          DATABASE_URL: DBURL,
          CLIENT_ID: process.env.CLIENT_ID,
          TOPGG_WEBHOOK_AUTH: process.env.TOPGG_WEBHOOK_AUTH,
          HF_TOKEN: process.env.HF_TOKEN,
          SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
          SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
          SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,
          DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI,
          DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
          DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
          THEDOGAPI_KEY: process.env.THEDOGAPI_KEY,
          THECATAPI_KEY: process.env.THECATAPI_KEY,
        }
      })
    } else {
      await client.prisma.$executeRawUnsafe(`CREATE DATABASE customBot_${clientId};`).catch(() => null)

      const turnBot = interaction.message.components[0].components[0]

      if (turnBot.style === 4) { // DANGER
        await interaction.message.deleteReply()
        await interaction.update({ components: [turnOffactionRow] });

        process.kill(bot[0].pid);
      } else {
        await fork("customBot", [interaction.user.id], {
          env: {
            BOT_TOKEN: token,
            DATABASE_URL: process.env.CUSTOMBOT_DATABASE_URL,
            CLIENT_ID: process.env.CLIENT_ID,
            TOPGG_WEBHOOK_AUTH: process.env.TOPGG_WEBHOOK_AUTH,
            HF_TOKEN: process.env.HF_TOKEN,
            SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
            SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
            SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,
            DISCORD_REDIRECT_URI: process.env.DISCORD_REDIRECT_URI,
            DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
            DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
            THEDOGAPI_KEY: process.env.THEDOGAPI_KEY,
            THECATAPI_KEY: process.env.THECATAPI_KEY,
          }
        })
        await interaction.message.deleteReply()
        await interaction.update({ components: [turnOnactionRow] })
      }
    }
    },
};
