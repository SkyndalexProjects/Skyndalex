import { PrismaClient } from '@prisma/client';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Connectors, Shoukaku } from 'shoukaku';
import { Logger } from './Logger.js';
import { Loaders } from './handlers/Loaders.js';

const Nodes = [
    {
        name: 'Localhost',
        url: '127.0.0.1:6969',
        auth: 'youshallnotpass'
    }
];

export class SkyndalexClient extends Client {
    prisma = new PrismaClient({});
    logger = new Logger();
    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
            partials: [Partials.Message],
            allowedMentions: { repliedUser: false }
        });
    }

    async init() {
        await Loaders.loadEvents(this, '../../events');
        this.shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes);
        this.shoukaku.on('error', (_, error) => console.error(error));

        this.commands = await Loaders.loadCommands('../../commands');
        this.components = await Loaders.loadComponents('../../components');
        this.modals = await Loaders.loadModals('../../modals');

        await this.prisma.$connect();
        await this.login(process.env.BOT_TOKEN);
    }
}
