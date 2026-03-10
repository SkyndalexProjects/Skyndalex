import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ContainerBuilder,
	MessageFlags,
	SectionBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "discord.js";
import type { SkyndalexClient } from "#classes";

export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const economyData = await client.prisma.economy.findMany();

	const economy = economyData.map((e) => ({
		userId: e.userId,
		wallet: e.wallet,
		bank: e.bank ?? 0,
		updatedAt: e.updatedAt,
	}));

	economy.sort((a, b) => b.wallet + b.bank - (a.wallet + a.bank));

	const USERS_PER_PAGE = 5;
	const page = 1;

	const start = (page - 1) * USERS_PER_PAGE;
	const users = economy.slice(start, start + USERS_PER_PAGE);
	const totalPages = Math.ceil(economy.length / USERS_PER_PAGE);

	const container = new ContainerBuilder();

	for (let i = 0; i < users.length; i++) {
		const rank = start + i + 1;
		const data = users[i];

		const user = await client.users.fetch(data.userId);

		const avatar = user.displayAvatarURL({
			extension: "png",
			size: 128,
		});

		if (i > 0) {
			container.addSeparatorComponents(
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small),
			);
		}

		const medal =
			rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

		container.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`[\`${medal} ${user.username}\`](https://discord.com/users/${user.id})\n\n- $${data.wallet.toLocaleString()}`,
					),
				)
				.setThumbnailAccessory(new ThumbnailBuilder().setURL(avatar)),
		);
	}

	container.addSeparatorComponents(
		new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large),
	);

	const userRank = economy.findIndex((e) => e.userId === interaction.user.id);
	const userPlace = userRank !== -1 ? `#${userRank + 1}` : "Unranked";
	const userPage =
		userRank !== -1 ? Math.ceil((userRank + 1) / USERS_PER_PAGE) : null;
	const userEntry = userRank !== -1 ? economy[userRank] : null;
	const lastUpdateTimestamp = userEntry
		? Math.floor(userEntry.updatedAt.getTime() / 1000)
		: null;

	container.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			[
				`-# 📄 Current page: ${page}/${totalPages}`,
				`-# 🔎 Your account can be found on page ${userPage ?? "N/A"}`,
				`-# 🏅 Your place: ${userPlace}`,
				`-# 🕐 Last update on your account: ${lastUpdateTimestamp ? `<t:${lastUpdateTimestamp}:R>` : "N/A"}`,
			].join("\n"),
		),
	);

	container.addSeparatorComponents(
		new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large),
	);

	//TODO: handling pagination

	container.addActionRowComponents(
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId(`lb_prev_${page}`)
				.setLabel("Prev")
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 1),

			new ButtonBuilder()
				.setCustomId("lb_page")
				.setLabel(`Page ${page}/${totalPages}`)
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true),

			new ButtonBuilder()
				.setCustomId(`lb_next_${page}`)
				.setLabel("Next")
				.setStyle(ButtonStyle.Primary)
				.setDisabled(page === totalPages),
		),
	);

	await interaction.reply({
		components: [container],
		flags: MessageFlags.IsComponentsV2,
	});
}

export const data = new SlashCommandBuilder()
	.setName("leaderboard")
	.setDescription("Guild leaderboard");
