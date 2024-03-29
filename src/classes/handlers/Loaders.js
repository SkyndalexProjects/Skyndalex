import { Collection } from 'discord.js';
import { readdir } from 'fs/promises';

export class Loaders {
    static async loadCommands(path) {
        const commands = new Collection();

        const files = await readdir(new URL(path, import.meta.url));

        for (const commandCategory of files) {
            const commandPath = await readdir(new URL(`${path}/${commandCategory}`, import.meta.url));
            for (const file of commandPath) {
                const command = await import(`${path}/${commandCategory}/${file}`);
                if (!command.data?.name) return console.log(`Command ${file} does not have a name`);

                commands.set(command.data.name, command);
            }
        }
        return commands;
    }
    static async loadEvents(client, path) {
        const files = await readdir(new URL(path, import.meta.url));

        for (const file of files) {
            if (file.split('.')[1] !== 'js' && !file.split('.')[2]) continue;
            const event = await import(`${path}/${file}`);
            const name = file.split('.')[0];
            client.on(name, (...events) => event[name](client, ...events));
        }
    }
}
