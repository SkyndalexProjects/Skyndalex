import { REST, Routes } from "discord.js";
import { commands } from "../../../handlers/commandHandler.js";

export default {
  customId: "customBotDeploy",
  type: "button",

  run: async (client, interaction) => {
    const clientId = interaction.customId.split("-")[1];
    const getToken = await client.prisma.customBots.findMany({
      where: {
        userId: interaction.user.id,
        clientId: clientId,
      },
    });

    const token = getToken[0].token

    console.log("token", token)
    const rest = new REST({ version: "10" }).setToken(token);

    try {
      await interaction.deferReply({ ephemeral: true });

      const cmds = commands.map((cmd) => cmd.data.toJSON());

      await interaction.editReply({
        content: `Started refreshing ${cmds.length} application (/) commands.`,
      });

      const data = await rest.put(Routes.applicationCommands(clientId), {
        body: cmds,
      });

      await interaction.editReply({
        content: `Successfully reloaded ${data.length} application (/) commands.`,
      });
    } catch (error) {
      console.error(error);
    }
  },
};