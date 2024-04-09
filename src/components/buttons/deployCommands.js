import { EmbedBuilder, REST, Routes } from "discord.js";
import { parsedCommands } from "../../events/ready.js";
import { addCooldown } from "../../functions/addCooldown.js";

export async function run(client, interaction) {
  const clientId = interaction.customId.split("-")[1];
  const bot = await client.prisma.customBots.findMany({
    where: {
      clientId: clientId,
      userId: interaction.user.id,
    }
  });
  try {
    await interaction.deferReply({ ephemeral: true });

    const deployCooldown = await addCooldown(true, client, interaction, 300)
    if (deployCooldown) {
      const futureDate = new Date();
      futureDate.setSeconds(
        futureDate.getSeconds() +
        Math.floor(Number(deployCooldown)),
      );

      const embedCooldown = new EmbedBuilder()
        .setDescription(
          `❌ | You are on cooldown. Please wait <t:${Math.floor(
            futureDate.getTime() / 1000,
          )}:R> seconds before using this interaction again.`,
        )
        .setColor("Red");
      return await interaction.editReply({
        embeds: [embedCooldown],
        ephemeral: true,
      });
    } else {
      await interaction.editReply({ content: `Started refreshing ${parsedCommands.length} application (/) commands.` });

      await client.customBotManager.deployCommands(parsedCommands, clientId, bot[0].token);

      await interaction.editReply({ content: `Successfully reloaded ${parsedCommands.length} application (/) commands.` });
    }
  } catch (error) {
    console.error(error);
  }
}
