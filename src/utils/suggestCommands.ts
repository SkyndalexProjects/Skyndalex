import type { SkyndalexClient } from "#classes";
export async function suggestCommands(client: SkyndalexClient, userId: string) {
	// </COMMAND_NAME:COMMAND_ID>

	const fetchedCommands = await client.application.commands.fetch();


	const commands = fetchedCommands.random(5)
	.filter((command) => !command.name.includes("test"))
	.map((command) => {
		return `</${command.name}:${command.id}>`
	})

	const getSuggested =
		await client.prisma.alreadySuggestedCommandsTo.findFirst({
			where: {
				userId,
			},
		});

	if (getSuggested) {
		return null;
	}
	await client.prisma.alreadySuggestedCommandsTo.create({
		data: {
			userId,
		},
	});

	return commands;
}
