import type { SkyndalexClient } from "#classes";
export async function suggestCommands(client: SkyndalexClient, userId: string) {
	// </COMMAND_NAME:COMMAND_ID>

	const fetchedCommands = await client.application.commands.fetch();

	const commands = fetchedCommands
		.filter((command) => !command.name.includes("test"))
		.random(5)
		.map((command) => {
			return `</${command.name}:${command.id}>`;
		});

	const getSuggested = await client.prisma.users.findFirst({
		where: {
			userId,
		},
	});

	if (getSuggested?.usedCommand) {
		return null;
	}

	await client.prisma.users.upsert({
		where: {
			userId,
		},
		update: {
			usedCommand: true,
		},
		create: {
			userId,
			usedCommand: true,
		},
	});

	return commands;
}
