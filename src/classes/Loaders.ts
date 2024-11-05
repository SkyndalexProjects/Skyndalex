import type { SkyndalexClient } from "#classes";
import { readdir } from "fs/promises";

export class Loaders {
	async loadEvents(client: SkyndalexClient, path: string) {
		const files = await readdir(new URL(path, import.meta.url));
		for (const file of files) {
			if (!file.endsWith(".js") && !file.endsWith(".ts")) continue;
			const event = await import(`${path}/${file}`);
			const name = file.split(".")[0];
			client.on(name, (...events) => event[name](client, ...events));
		}
	}
}
