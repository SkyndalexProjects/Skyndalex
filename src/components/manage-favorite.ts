import { RadioProvider } from "@prisma/client";
import {
	ButtonStyle,
	ContainerBuilder,
	type MessageComponentInteraction,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";
import { swapButton } from "#utils";

export async function run(
	client: SkyndalexClient,
	interaction: MessageComponentInteraction,
) {
	await interaction.deferUpdate();

	if (!interaction.guildId) {
		const container = new ContainerBuilder()
			.setAccentColor(0xed4245)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					"### ⚠️ Not available outside a server\nThis button can only be used inside a server.",
				),
			);

		return await interaction.followUp({
			components: [container],
			flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
		});
	}

	const instance = client.radioStateManager.getInstance(interaction.guildId);
	const existingFavorite = await client.prisma.radioFavorites.findUnique({
		where: {
			userId_provider_stationSource: {
				userId: interaction.user.id,
				provider: instance.provider,
				stationSource: instance.stationSource,
			},
		},
	});

	const isAdding = !existingFavorite;
	if (!instance) {
		const container = new ContainerBuilder()
			.setAccentColor(0xed4245)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					"> There is no active radio station to save to your favorites.",
				),
			);

		return await interaction.followUp({
			components: [container],
			flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
		});
	}

	const providerLabel =
		instance.provider === RadioProvider.RADIO_GARDEN
			? "Radio Garden"
			: "Radio Browser";

	try {
		if (isAdding) {
			await client.prisma.radioFavorites.create({
				data: {
					userId: interaction.user.id,
					provider: instance.provider,
					stationSource: instance.stationSource,
					stationName: instance.radioStation,
					resourceUrl: instance.resourceUrl ?? "",
				},
			});
		} else {
			await client.prisma.radioFavorites.delete({
				where: {
					userId_provider_stationSource: {
						stationSource: instance.stationSource,
						userId: interaction.user.id,
						provider: instance.provider,
					},
				},
			});
		}
	} catch (error) {
		console.error(
			`Error ${isAdding ? "adding" : "removing"} radio favorite:`,
			error,
		);

		const container = new ContainerBuilder()
			.setAccentColor(0xed4245)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`### ⚠️ Something went wrong\nCould not ${isAdding ? "add" : "remove"} **${instance.radioStation}** ${isAdding ? "to" : "from"} your favorites. Please try again.`,
				),
			);

		return await interaction.followUp({
			components: [container],
			flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
		});
	}

	// Rebuild the original message's components, flipping the favorite button
	const updatedComponents = await swapButton(
		interaction.message.components.map((c) => c.toJSON()),
		isAdding ? "radio-add-favorite" : "radio-remove-favorite",
		isAdding
			? {
					custom_id: "radio-remove-favorite",
					label: "Delete from favorites",
					style: ButtonStyle.Danger,
				}
			: {
					custom_id: "radio-add-favorite",
					label: "Add to favorites",
					style: ButtonStyle.Primary,
				},
	);

	await interaction.editReply({
		components: updatedComponents,
		flags: MessageFlags.IsComponentsV2,
	});

	const container = new ContainerBuilder()
		.setAccentColor(isAdding ? 0x2ecc71 : 0xf1c40f)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				isAdding
					? `### ⭐ | Added to favorites!\n**${instance.radioStation}** has been added to your favorite radio stations.`
					: `### ❌ | Removed from favorites!\n**${instance.radioStation}** has been removed from your favorite radio stations.`,
			),
		)
		.addSeparatorComponents(
			new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`📡 Source: **${providerLabel}**\n🔗 Stream URL: ${instance.resourceUrl ? `[open stream](${instance.resourceUrl})` : "none"}`,
			),
		);

	return await interaction.followUp({
		components: [container],
		flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
	});
}
