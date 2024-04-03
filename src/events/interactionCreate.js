import { EmbedBuilder, InteractionType } from "discord.js";
import { addCooldown } from "../functions/addCooldown.js";

export async function interactionCreate(client, interaction) {
	switch (interaction.type) {
		case InteractionType.ApplicationCommand:
			if (!interaction.isChatInputCommand()) return;
			client.logger.log(
				`[USED APPLICATION COMMAND] (201) : commandName: ${
					interaction.commandName
				} | user: ${interaction.user.username} [${
					interaction.user.id
				}] | guild: 1058882286210261073 [${
					interaction.guild?.name || "No guild. DM"
				}] | channel: ${
					interaction.guild?.id || "No channel found (dm)"
				} [#${interaction.channel?.name}]`,
			);

			const subcommand = interaction.options.getSubcommand(false);
			const command = client.commands.get(
				subcommand
					? `${interaction.commandName}/${subcommand}`
					: interaction.commandName,
			);
			const wrongCommand = new EmbedBuilder()
				.setDescription(
					`❌ | Unknown command. Command \`${interaction.commandName}\` doesnt exists anymore..`,
				)
				.setColor("Red");
			if (!command) return interaction.reply({ embeds: [wrongCommand] });
			try {
				const getCooldownSettings =
					await client.prisma.guildCooldownsSettings.findFirst({
						where: {
							guildId: interaction?.guild?.id,
							command: interaction.commandName,
						},
					});
				if (getCooldownSettings) {
					const cooldown = await addCooldown(
						client,
						interaction,
						getCooldownSettings.cooldown,
					);
					if (cooldown) {
						const futureDate = new Date();
						futureDate.setSeconds(
							futureDate.getSeconds() +
								Math.floor(Number(cooldown)),
						);

						const embedCooldown = new EmbedBuilder()
							.setDescription(
								`❌ | You are on cooldown. Please wait <t:${Math.floor(
									futureDate.getTime() / 1000,
								)}:R> seconds before using this command again.`,
							)
							.setColor("Red");
						return await interaction.reply({
							embeds: [embedCooldown],
							ephemeral: true,
						});
					}
				}
				await command.run(client, interaction);
			} catch (error) {
				console.error(error);
				const embedError = new EmbedBuilder()
					.setDescription(
						`**❌ | There was an error while executing this command. Please try again later.**\n\nError title: \`${error.name}\`\nError message: \`${error.message}\``,
					)
					.setColor("Red")
					.setTimestamp();
				await interaction.reply({
					embeds: [embedError],
					ephemeral: true,
				});
			}
			break;
		case InteractionType.MessageComponent:
			client.logger.log(
				`[USED MESSAGE COMPONENT] (201) : componentName: ${
					interaction.customId
				} | user: ${interaction.user.username} [${
					interaction.user.id
				}] | guild: 1058882286210261073 [${
					interaction.guild?.name || "No guild. DM"
				}] | channel: ${
					interaction.guild?.id || "No channel found (dm)"
				} [#${interaction.channel?.name}]`,
			);

			const componentNotFound = new EmbedBuilder()
				.setDescription(
					`❌ | Unknown component. CustomId \`${interaction.customId}\` doesn't exist.`,
				)
				.setColor("Red");
			client.logger.error(
				`Unknown component. CustomId ${interaction.customId} doesn't exist.`,
			);
			const component = client.components.get(
				interaction.customId.split("-")[0],
			);
			if (!component)
				return interaction.reply({
					embeds: [componentNotFound],
					ephemeral: true,
				});

			try {
				await component.run(client, interaction);
			} catch (error) {
				console.error(error);
				await interaction.reply(
					"Oops, there was an error while executing this interaction.",
				);
			}
			break;
		case InteractionType.ModalSubmit: {
			client.logger.log(
				`[USED MODAL SUBMIT] (201) : modalSubmitName: ${
					interaction.customId
				} | user: ${interaction.user.username} [${
					interaction.user.id
				}] | guild: 1058882286210261073 [${
					interaction.guild?.name || "No guild. DM"
				}] | channel: ${
					interaction.guild?.id || "No channel found (dm)"
				} [#${interaction.channel?.name}]`,
			);

			const modal = client.modals.get(interaction.customId);
			if (!modal)
				return interaction.reply("Ooops, this modal doesn't exist.");

			try {
				await modal.run(client, interaction);
			} catch (error) {
				console.error(error);
				await interaction.reply(
					"Oops, there was an error while executing this modal.",
				);
			}
		}
	}
}
