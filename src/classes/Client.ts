import {
	ActivityType,
	ChatInputCommandInteraction,
	Client,
	Collection,
	GatewayIntentBits, Interaction,
	Partials,
	SlashCommandBuilder
} from "discord.js";
import { PrismaClient } from "@prisma/client";
import { Loaders } from "./Loaders";
interface Command {
	data: SlashCommandBuilder;
	run: (client: SkyndalexClient, interaction: Interaction) => Promise<void>;
}
interface Component {
	data: Interaction;
	run: (client: SkyndalexClient, interaction: Interaction) => Promise<void>;
}
export class SkyndalexClient extends Client {
	prisma = new PrismaClient();
	commands: Collection<string, Command>;
	components: Collection<string, Component>;

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
		this.components = await this.loader.loadComponents("../components");

		await this.login(process.env.BOT_TOKEN)
	}
}