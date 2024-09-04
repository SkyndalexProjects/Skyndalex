import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("advancement")
	.setDescription("Create an advancement")
	.setIntegrationTypes([0, 1])
	.setContexts([0, 1, 2])