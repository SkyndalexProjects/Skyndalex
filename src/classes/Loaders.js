import chalk from 'chalk';
import { Collection } from 'discord.js';
import { readdir } from 'fs/promises';
import { readdirSync } from 'fs';

export class Loaders {
    static async loadCommands(path) {
        const commands = new Collection();

        const dir = await readdir(new URL(path, import.meta.url));

        for (const category of dir.filter((file) => !file.endsWith('.js'))) {
            const files = await readdir(new URL(`${path}/${category}`, import.meta.url));

            // Subcommand handling
            for (const file of files.filter(file => !file.endsWith('.js'))) {

                const subCommands =  await readdir(new URL(`${path}/${category}/${file}`, import.meta.url));

                for (const v of subCommands) {
                    const command = await import(`${path}/${category}/${file}/${v}`);
                    commands.set(`${file.split(".")[0]}/${v.split(".")[0]}`, command)
                }
            }

            // Command handling
            for (const file of files.filter(file => file.endsWith('.js'))) {
                const command = await import(`${path}/${category}/${file}`);
                const name = file.split('.')[0];
                commands.set(name, command);
            }
        }

        console.log(
          `[${chalk.whiteBright(chalk.underline( new Date().toUTCString()))}] ${chalk.greenBright('[HANDLERS]')} ${chalk.greenBright(
            chalk.bold(`Loaded ${commands.size} commands.`)
          )}`
        );
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
    static async loadComponents(path) {
        const components = new Collection();

        const files = await readdir(new URL(path, import.meta.url));

        for (const file of files) {
            const component = await readdir(new URL(`${path}/${file}`, import.meta.url));
            for (const comp of component) {
                const componentFile = await import(`${path}/${file}/${comp}`);
                const customId = comp.split('.')[0];
                if (!componentFile) return console.log(`Component ${comp} does not have a run function`);
                components.set(customId, componentFile);
            }
        }
        console.log(
          `[${chalk.whiteBright(chalk.underline(new Date().toUTCString()))}] ${chalk.greenBright(
            '[HANDLERS]'
          )} ${chalk.greenBright(chalk.bold(`Loaded ${components.size} components.`))}`
        );

        return components;
    }
    static async loadModals(path) {
        const modals = new Collection();

        const files = await readdir(new URL(path, import.meta.url));

        for (const file of files) {
            const modal = await import(`${path}/${file}`);
            const customId = file.split('.')[0];
            if (!modal) return console.log(`Modal ${file} does not have a run function`);
            modals.set(customId, modal);
        }
        console.log(
          `[${chalk.whiteBright(chalk.underline(new Date().toUTCString()))}] ${chalk.greenBright(
            '[HANDLERS]'
          )} ${chalk.greenBright(chalk.bold(`Loaded ${modals.size} modals.`))}`
        );
        return modals;
    }
}