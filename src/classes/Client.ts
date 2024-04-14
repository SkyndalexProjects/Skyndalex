import {
	ActivityType,
	ChatInputCommandInteraction,
	Client,
	Collection,
	GatewayIntentBits,
	Partials,
	SlashCommandBuilder
} from "discord.js";
import { PrismaClient } from "@prisma/client";
import { Loaders } from "./Loaders";
interface Command {
	data: SlashCommandBuilder;
	run: (client: SkyndalexClient, interaction: ChatInputCommandInteraction) => Promise<void>;
}
export class SkyndalexClient extends Client {
	prisma = new PrismaClient();
	commands: Collection<string, Command>;
	loader = new Loaders();

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			],
			partials: [Partials.Message],
			allowedMentions: {repliedUser: false},
			presence: {
				activities: [
					{
						name: `Check out new ${process.env.npm_package_version} version!`,
						type: ActivityType.Playing,
					},
				],
			},
		});
	}

	async init() {
		await this.loader.loadEvents(this, "../events");
		this.commands = await this.loader.loadCommands("../commands");

		await this.login(process.env.BOT_TOKEN)
	}
}