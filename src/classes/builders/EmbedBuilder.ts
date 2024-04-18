import { EmbedBuilder as embedBuilder, EmbedFooterOptions } from "discord.js";
import type { SkyndalexClient } from "../Client";
export class EmbedBuilder extends embedBuilder {
	locale: string;
	constructor(
		private readonly client: SkyndalexClient,
		locale: string,
	) {
		super();
		this.locale = locale;
		this.setTimestamp();
	}
	setDescription(description: string, args = {}): this {
		super.setDescription(
			this.client.i18n.t(description, { lng: this.locale, ...args }),
		);
		return this;
	}

	setFooter({
		text,
		textArgs,
		iconURL,
	}: { text: string; textArgs?: Record<string, string>; iconURL?: string }): this {
		return super.setFooter({
			text: this.client.i18n.t(text, {
				lng: this.locale,
				...textArgs,
			}) as string,
			iconURL,
		});
	}
}
