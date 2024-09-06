import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("set")
	.setDescription("Guild settings")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
