import {
	SlashCommandBuilder,
    type SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    Routes
} from "discord.js";
import type { SkyndalexClient } from "../classes/Client";

export async function ready(client: SkyndalexClient) {
    const parsedCommands = [];

    for (const [key, value] of client.commands) {
        if (key.includes("/")) {
            if (!key.includes("index") || key.split("/").length > 2) continue;

            const [commandName] = key.split("/");

            const subcommands = client.commands.filter(
                (x, v) =>
                    v.startsWith(`${commandName}/`) && !v.includes("index")
            );

            const command = value.data as SlashCommandBuilder;

            for (const [key, value] of subcommands.entries()) {
                if (key.split("/").length <= 2) {
                    if (command instanceof SlashCommandBuilder) {
                        command.addSubcommand(
                            value.data as unknown as SlashCommandSubcommandBuilder,
                        );
                    }
                } else {
                    const groupName = key.split("/")[1];

                    const groups = client.commands.filter(
                        (x, v) =>
                            v.startsWith(`${commandName}/${groupName}`) &&
                            !v.includes("index")
                    );

                    const groupIndex = client.commands.get(
                        `${commandName}/${groupName}/index`
                    );
                    if (!groupIndex) continue;

                    if (groupIndex.data instanceof SlashCommandSubcommandGroupBuilder) {
                        for (const [gk, gv] of groups.entries()) {
                            groupIndex.data.addSubcommand(
                                gv.data as unknown as SlashCommandSubcommandBuilder
                            );
                        }

                        if (command instanceof SlashCommandBuilder) {
                            command.addSubcommandGroup(
                                groupIndex.data as unknown as SlashCommandSubcommandGroupBuilder
                            );
                        }
                    }
                }
            }
            parsedCommands.push(command);
        } else {
            parsedCommands.push(value.data);
        }
    }

    const globalData = await client.rest.put(
        Routes.applicationCommands(client.user.id),
        { body: parsedCommands },
    ) as Map<string, unknown>;

    client.logger.success(
        `Ready in ${((performance.now() - client.createdAt) / 1000).toFixed(
            2,
        )}s (commands: ${globalData.size})`,
    );
}
