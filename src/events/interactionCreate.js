import chalk from 'chalk';
import { InteractionType } from 'discord.js';

export async function interactionCreate(client, interaction) {
    console.log(
        `${chalk.bold(chalk.underline(`[${new Date().toUTCString()}]`))} ${chalk.yellowBright(
            '[USED INTERACTION]'
        )} ${chalk.blue(chalk.bold('(201)'))} : user: ${chalk.bold(
            chalk.magenta(interaction.user.username)
        )} [${chalk.bold(chalk.magenta(interaction.user.id))}] | guild: ${chalk.blueBright(
            '1058882286210261073'
        )} [${chalk.blue(interaction.guild?.name || 'No guild. DM')}] | channel: ${chalk.yellow(
            interaction.guild?.id || 'No channel found (dm)'
        )} [#${chalk.yellowBright(interaction.channel?.name)}]`
    );

    console.log(interaction.type);
    switch (interaction.type) {
        case InteractionType.ApplicationCommand:
            if (!interaction.isChatInputCommand()) return;
            const command = client.commands.get(interaction.commandName);
            if (!command) return interaction.reply("Ooops, this command doesn't exist.");

            try {
                await command.run(client, interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply('Oops, there was an error while executing this command.');
            }
            break;
        case InteractionType.MessageComponent:
            const interactionData = client.interactions.get(interaction.customId);
            if (!interactionData) return interaction.reply("Ooops, this interaction doesn't exist.");

            try {
                await interactionData.run(client, interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply('Oops, there was an error while executing this interaction.');
            }
            break;

    }
}
