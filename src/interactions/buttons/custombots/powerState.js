import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import find from 'find-process';
export default {
    customId: `customBotPowerState`,
    type: 'button',

    run: async (client, interaction) => {
        const selectedClientId = interaction.customId.split('-')[1];
        const embedInvalidBot = new EmbedBuilder()
            .setTitle('Manage your custombot')
            .setDescription(
                `Current bot: **Unkown**\nCurrent bot status: <:offline:1062072773406642226> | **Invalid bot**`
            )
            .setColor('Red');

        const select = new StringSelectMenuBuilder()
            .setCustomId('customBotSelect')
            .setPlaceholder('Choose a custombot!');

        const powerStateOff = new ButtonBuilder()
            .setLabel('Turn bot off')
            .setStyle(ButtonStyle.Danger)
            .setCustomId(`customBotPowerState-${selectedClientId}`);

        const powerStateOn = new ButtonBuilder()
            .setLabel('Turn bot on')
            .setStyle(ButtonStyle.Success)
            .setCustomId(`customBotPowerState-${selectedClientId}`);

        const disabledButton = new ButtonBuilder()
            .setLabel('Turn bot on')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true)
            .setCustomId('a co to robi');

        const turnOnactionRow = new ActionRowBuilder().addComponents(powerStateOff);
        const turnOffactionRow = new ActionRowBuilder().addComponents(powerStateOn);

        const disableAction = new ActionRowBuilder().addComponents(disabledButton);

        const selectRow = new ActionRowBuilder().addComponents(select);

        const findUserBots = await client.prisma.customBots.findMany({
            where: {
                userId: interaction.user.id
            }
        });

        for (const bot of findUserBots) {
            const getBot = await client.users.fetch(bot.clientId).catch(() => null);

            select.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Custom bot: ${getBot?.username || 'Unknown'}`)
                    .setValue(bot.clientId)
            );
        }

        await interaction.deferUpdate({ ephemeral: true });

        const getBot = await client.users.fetch(selectedClientId).catch(() => null);
        if (!getBot)
            return interaction.editReply({
                embeds: [embedInvalidBot],
                components: [selectRow, disableAction]
            });

        const clientId = interaction.customId.split('-')[1];

        const embedPreparing = new EmbedBuilder()
            .setTitle(`Manage your custombot`)
            .setDescription(
                `Current bot: **${
                    getBot?.username || 'Unkown'
                }**\nCurrent bot status: <a:4704loadingicon:1183416396223352852> | **Preparing**`
            )
            .setColor('Yellow');

        await interaction.editReply({
            content: '',
            embeds: [embedPreparing],
            components: [selectRow, disableAction],
            ephemeral: true
        });

        const bot = await find('name', `customBot ${selectedClientId}`);

        console.log('is the bot online?', bot[0]);

        const getToken = await client.prisma.customBots.findMany({
            where: {
                userId: interaction.user.id,
                clientId: clientId
            }
        });

        const token = getToken[0]?.token;

        if (bot[0]?.pid) {
            console.log('na czerwonym lol');
            await interaction.editReply({ components: [turnOffactionRow] });

            const embedTurningOff = new EmbedBuilder()
                .setTitle(`Manage your custombot`)
                .setDescription(
                    `Current bot: **${getBot.username}**\nCurrent bot status: <a:4704loadingicon:1183416396223352852> | **Turning off**`
                )
                .setColor('DarkButNotBlack');
            await interaction.editReply({
                content: '',
                embeds: [embedTurningOff],
                ephemeral: true
            });

            const kill = process.kill(bot[0].pid);
            console.log(kill);
            const embedOff = new EmbedBuilder()
                .setTitle(`Manage your custombot`)
                .setDescription(
                    `Current bot: **${getBot.username}**\nCurrent bot status: <:offline:1062072773406642226>  | **Offline** (Turned off)`
                )
                .setColor('Red');
            await interaction.editReply({
                content: '',
                embeds: [embedOff],
                components: [turnOffactionRow, selectRow],
                ephemeral: true
            });
        } else {
            const embedTurningOn = new EmbedBuilder()
                .setTitle(`Manage your custombot`)
                .setDescription(
                    `Current bot: **${getBot.username}**\nCurrent bot status: <a:4704loadingicon:1183416396223352852> | **Turning on**`
                )
                .setColor('DarkButNotBlack');
            await interaction.editReply({
                embeds: [embedTurningOn],
                ephemeral: true
            });

            await client.customBotManager.init(clientId, token);

            const embedLogged = new EmbedBuilder()
                .setTitle(`Manage your custombot`)
                .setDescription(
                    `Current bot: **${getBot.username}**\nCurrent bot status: <:online:1062072775583485973> | **Online**`
                )
                .setColor('Green');

            await interaction.editReply({
                content: '',
                embeds: [embedLogged],
                ephemeral: true,
                components: [turnOnactionRow, selectRow]
            });
        }
    }
};
