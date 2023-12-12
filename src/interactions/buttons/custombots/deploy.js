import { REST, Routes } from "discord.js";
import { commands } from "../../../handlers/commandHandler.js";

export default {
  customId: "customBotDeploy",
  type: "button",

  run: async (client, interaction) => {
    const bot = await client.prisma.customBots.findUnique({
      where: { userId: interaction.user.id },
    });
    const rest = new REST({ version: "10" }).setToken(bot.token);

    try {
      await interaction.deferReply({ ephemeral: true });

      await interaction.editReply({
        content: `Started refreshing ${commands.length} application (/) commands.`,
      });

      const data = await rest.put(Routes.applicationCommands(bot.clientId), {
        body: commands.map((cmd) => cmd.data.toJSON()),
      });

      await interaction.editReply({
        content: `Successfully reloaded ${data.length} application (/) commands.`,
      });
    } catch (error) {
      console.error(error);
    }
  },
};
