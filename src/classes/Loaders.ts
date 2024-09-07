import { readdir, readFile } from "node:fs/promises";
import { Collection } from "discord.js";
import type { Command, Component, Modal } from "../types/structures.js";
import { SkyndalexClient } from "./Client.js";
export class Loaders {
	async loadCommands(path: string): Promise<Collection<string, Command>> {
		const commands = new Collection<string, Command>();
		const dir = await readdir(new URL(path, import.meta.url));

		for (const category of dir) {
			const { files, directoriesFound } = await this.loadFolder(
				new URL(`${path}/${category}`, import.meta.url),
			);
			for (const [name, command] of files) {
				const commandWithCategory = {
					...(command as object),
					category,
				};
				commands.set(name, commandWithCategory as unknown as Command);
			}

			for (const directory of directoriesFound) {
				const { files } = await this.loadFolder(
					new URL(
						`${path}/${category}/${directory}`,
						import.meta.url,
					),
				);

				for (const [name, command] of files) {
					const commandWithCategory = {
						...(command as object),
						category,
					};
					commands.set(
						`${directory}/${name}`,
						commandWithCategory as unknown as Command,
					);
				}
			}
		}
		return commands;
	}
	async loadEvents(client: SkyndalexClient, path: string) {
		const files = await readdir(new URL(path, import.meta.url));
		for (const file of files) {
			if (!file.endsWith(".js") && !file.endsWith(".ts")) continue;
			const event = await import(`${path}/${file}`);
			const name = file.split(".")[0];
			client.on(name, (...events) => event[name](client, ...events));
		}
	}
	async loadComponents(path: string): Promise<Collection<string, Component>> {
		const components = new Collection<string, Component>();
		const categories = await readdir(new URL(path, import.meta.url));
		for (const category of categories) {
			const componentFiles = await readdir(
				new URL(`${path}/${category}`, import.meta.url),
			);
			for (const component of componentFiles) {
				if (!component.endsWith(".ts") && !component.endsWith(".js"))
					continue;

				const componentFile = await import(
					`${path}/${category}/${component}`
				);
				const customId = component.split(".")[0];
				components.set(customId, componentFile);
			}
		}
		return components;
	}
	async loadModals(path: string): Promise<Collection<string, Modal>> {
		const modals = new Collection<string, Modal>();
		const modalFiles = await readdir(new URL(path, import.meta.url));
		for (const modal of modalFiles) {
			if (!modal.endsWith(".ts") && !modal.endsWith(".js")) continue;

			const modalFile = await import(`${path}/${modal}`);
			const customId = modal.split(".")[0];
			modals.set(customId, modalFile);
		}
		return modals;
	}
	async loadFolder<T>(
		folder: string | URL,
	): Promise<{ files: Map<string, T>; directoriesFound: string[] }> {
		const files = new Map();
		const directory = await readdir(folder).catch((e) => {});
		const directoriesFound: string[] = [];
		if (!directory) return { files, directoriesFound };
		for (const file of directory) {
			if (!file.endsWith(".ts") && !file.endsWith(".js")) {
				directoriesFound.push(file);
				continue;
			}
			const path = `${folder}/${file}`;
			const data = await import(path);
			files.set(file.split(".")[0], data);
		}
		return { files, directoriesFound };
	}
}
