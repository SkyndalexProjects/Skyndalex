import {
	type ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
} from "discord.js";
import * as cheerio from "cheerio";
import type { SkyndalexClient } from "#classes";
export async function run(
	client: SkyndalexClient,
	interaction: ChatInputCommandInteraction,
) {
	const url = interaction.options.getString("link");
	const html = await fetch(url).then((res) => res.text());
	const $ = cheerio.load(html);

	const user = $("td.system-name:contains('User')")
		.next("td.system-value")
		.text()
		.trim();

	const embed = new EmbedBuilder()
		.setDescription(
			client.i18n.t("GEEKBECH_DESC", {
				lng: interaction.locale,
				link: url,
				user,
				singleCoreScore:
					$(
						".score-container.score-container-1.desktop > .score",
					).text() || $(".score-container > .score").text(),
				multiCoreScore:
					$(".score-container.desktop > .score").eq(1).text() ||
					"None",
			}),
		)
		.addFields([
			{
				name: client.i18n.t("GEEKBENCH_HOME_INFO", {
					lng: interaction.locale,
				}),
				value: client.i18n.t("GEEKBENCH_HOME_INFO_VALUES", {
					lng: interaction.locale,
					upload: $("td.system-name:contains('Upload Date')")
						.next("td.system-value")
						.text()
						.trim(),
					views: $("td.system-name:contains('Views')")
						.next("td.system-value")
						.text()
						.trim(),
				}),
			},
			{
				name: client.i18n.t("GEEKBENCH_SYSTEM_INFO", {
					lng: interaction.locale,
				}),
				value: client.i18n.t("GEEKBENCH_SYSTEM_INFO_VALUES", {
					lng: interaction.locale,
					os: $("td.system-name:contains('Operating System')")
						.next("td.system-value")
						.text()
						.trim(),
					cpu: $("td.system-name:contains('Name')")
						.next("td.system-value")
						.text()
						.trim(),
					ram: $("td.system-name:contains('Memory')")
						.next("td.system-value")
						.text()
						.trim(),
				}),
			},
		])
		.setColor("DarkButNotBlack");

	interaction.reply({
		embeds: [embed],
	});
}

export const data = {
	...new SlashCommandBuilder()
		.setName("geekbench")
		.setDescription("Get your geekbench data")
		.addStringOption((option) =>
			option
				.setName("link")
				.setDescription("Link to your geekbench")
				.setRequired(true),
		),
	integration_types: [0, 1],
	contexts: [0, 1, 2],
};
