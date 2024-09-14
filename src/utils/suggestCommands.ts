import { SkyndalexClient } from "#classes";
import { Collection} from "discord.js";
import { EmbedBuilder } from "#builders";
import type { Command } from "#types";
export async function suggestCommands(
	client: SkyndalexClient,
    userId: string,
) {
    // </COMMAND_NAME:COMMAND_ID>

    const fetchedCommands = await client.application.commands.fetch();

    const commands = fetchedCommands
    .random(5)
    .map((command) => {      
        return `</${command.name}:${command.id}>`;
    })

    const getSuggested = await client.prisma.alreadySuggestedCommandsTo.findFirst({
        where: {
            userId,
        }
    });
    
    if (getSuggested) {
        return null;
    } else {
        await client.prisma.alreadySuggestedCommandsTo.create({
            data: {
                userId,
            }
        });   
    }
    return commands;
}
