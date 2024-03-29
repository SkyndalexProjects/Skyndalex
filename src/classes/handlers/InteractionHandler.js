import { readdir } from 'fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export default class InteractionHandler {
    constructor(client) {
        this.client = client;
    }

    async loadInteractions(path = '../../interactions') {
        try {
            const __dirname = dirname(fileURLToPath(import.meta.url));
            const files = await readdir(resolve(__dirname, path), {
                withFileTypes: true
            });

            for (const file of files) {
                if (file.isFile() && file.name.endsWith('.js')) {
                    const { default: interaction } = await import(`${path}/${file.name}`);

                    const key = `${interaction.type}-${interaction.customId}`;
                    this.client.interactions.set(key, interaction);
                } else if (file.isDirectory()) {
                    await this.loadInteractions(`${path}/${file.name}`);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
}
