import { execSync, fork } from "child_process";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import find from "find-process";
export default {
  customId: `customBotPowerState`,
  type: "button",

  run: async (client, interaction) => {
    // TODO: rewrite to docker (future plans)
    await interaction.deferUpdate({ ephemeral: true })
    const embedPreparing = new EmbedBuilder()
      .setTitle("<a:4704loadingicon:1183416396223352852> | Im preapring your custombot, please wait")
      .setColor("Yellow")

    await interaction.editReply({ embeds: [embedPreparing], ephemeral: true })

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
    const turnBot = interaction.message.components[0].components[0]

    const { token, clientId } = await client.prisma.customBots.findUnique({
      where: { userId: interaction.user.id },
    });
    const DBURL = `postgresql://postgres:${process.env.CUSTOMBOT_DB_PASSWORD}@localhost:5432/custombot_${clientId}?schema=public`

    execSync(
      `SET DATABASE_URL=${DBURL} && npx prisma db push && npx prisma db pull && npx prisma migrate deploy --schema ./prisma/schema.prisma`,
      { stdio: 'inherit' },
    );


    if (!bot) {
      await client.prisma.$executeRawUnsafe(`CREATE DATABASE customBot_${clientId};`).catch(() => null);

      await fork("customBot", [interaction.user.id], {
        env: {
          BOT_TOKEN: token,
          CUSTOMBOT_DB_PASSWORD: process.env.CUSTOMBOT_DB_PASSWORD,
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
      });

      return await interaction.editReply({ components: [turnOnactionRow] }) && await interaction.deleteReply()
    } else {
      if (turnBot.style === 4) { // DANGER
        await interaction.editReply({ components: [turnOffactionRow]});

        await interaction.editReply({ content: "<a:4704loadingicon:1183416396223352852> | Bot is turning off, please wait...", ephemeral: true })
        process.kill(bot[0].pid);
        const embedOff = new EmbedBuilder()
          .setTitle(`Custom bot \`${clientId}\` is now offline`)
          .setColor("#ff0000")
        await interaction.editReply({ content: "", embeds: [embedOff], ephemeral: true })
      } else {
        // await client.prisma.$executeRawUnsafe(`CREATE DATABASE customBot_${clientId};`).catch(() => null)

        await interaction.editReply({ content: "<a:4704loadingicon:1183416396223352852> | Bot is turning on, please wait...", ephemeral: true })

        await fork("customBot", [interaction.user.id], {
          env: {
            BOT_TOKEN: token,
            CUSTOMBOT_DB_PASSWORD: process.env.CUSTOMBOT_DB_PASSWORD,
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

        const embedLogged = new EmbedBuilder()
          .setTitle(`Custom bot \`${clientId}\` is now online`)
          .setColor("#00ff00")

        await interaction.editReply({ content: "", embeds: [embedLogged], ephemeral: true })

        await interaction.editReply({ components: [turnOnactionRow] })
      }
    }
    },
};
