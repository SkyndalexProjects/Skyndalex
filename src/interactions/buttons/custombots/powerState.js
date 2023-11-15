import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import find from "find-process";
import { fork } from "child_process";
export default {
  customId: `customBotPowerState`,
  type: "button",

  run: async (client, interaction) => {
    const clientID = "1157757054723829812";

    let bot = await find("name", `customBot ${interaction.user.id}`);
    bot = bot[0];

    if (!bot)
      fork("customBot", [interaction.user.id], {
        stdio: "ignore",
        detached: true,
      });
    else {
      if (client.user.id != clientID) {
        await interaction.deferReply({ ephemeral: true });

        await interaction.editReply({
          content: "Restaring...",
          ephemeral: true,
        });
        fork("customBot", [interaction.user.id], {
          stdio: "ignore",
          detached: true,
        });

        await interaction.editReply("Restared");
        return process.kill(bot.pid);
      }
      process.kill(bot.pid);
    }

    const newActionRow = interaction.message.components.map((oldAR) => {
      const actionRow = new ActionRowBuilder();

      actionRow.addComponents(
        oldAR.components.map((c) => {
          const button = ButtonBuilder.from(c);

          if (interaction.component.customId === c.customId) {
            button.setLabel(
              client.user.id != clientID
                ? "Restart bot"
                : `Turn bot ${bot ? "on" : "off"}`,
            );
            button.setStyle(ButtonStyle[bot ? "Success" : "Danger"]);
          }
          return button;
        }),
      );
      return actionRow;
    });

    return interaction.update({ components: newActionRow });
  },
};
