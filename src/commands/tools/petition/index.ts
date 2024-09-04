import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("petition")
	.setDescription("Petitions")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2]);
