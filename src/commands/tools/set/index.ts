import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
	.setName("set")
	.setDescription("Guild configuration")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
