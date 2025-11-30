import { Routes } from "discord.js";
import type {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

export async function deploy(client: SkyndalexClient) {
    const commands = client.commands;

    if (!client.user?.id && client.application && !client.application.id) {
        await client.application.fetch();
    }

    const appId = client.user?.id ?? client.application?.id as string;

    const payload: RESTPostAPIApplicationCommandsJSONBody[] = [];

    for (const [key, cmd] of commands.entries()) {
        if (key.includes("/")) {
            const [name, subcommand] = key.split("/");
            if (subcommand !== "index") continue;

            const subcommands = commands.filter(
                (_value, k) => k.startsWith(`${name}/`) && k !== `${name}/index`,
            );

            const commandJson = (cmd.data as SlashCommandBuilder).toJSON();

            commandJson.options = commandJson.options ?? [];

            for (const subcmd of subcommands.values()) {
                const subJson =
                    ((subcmd.data as unknown as SlashCommandSubcommandBuilder).toJSON?.()) ||
                    (subcmd.data as unknown as SlashCommandSubcommandBuilder);
                if (subJson) {
                    commandJson.options.push(subJson);
                }
            }

            payload.push(commandJson);
        } else {
            payload.push((cmd.data as SlashCommandBuilder).toJSON());
        }
    }

    console.log("Payload", payload);
    await client.rest.put(Routes.applicationCommands(appId), {
        body: payload,
    });

    console.log("Deployed commands:", payload.length);
    return commands;
}
