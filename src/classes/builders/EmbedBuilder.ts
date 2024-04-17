import { type LocalizationMap, EmbedBuilder as embedBuilder } from "discord.js";
import * as process from "process";
import type { SkyndalexClient } from "../Client";
export class EmbedBuilder extends embedBuilder {
	locale: string;
	constructor(
		private readonly client: SkyndalexClient,
		locale: keyof LocalizationMap,
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
	setFooter(text: string, textArgs = {}, iconUrl?: string): this {
		super.setFooter(
			this.client.i18n.t(text, { lng: this.locale, ...textArgs }),
			iconUrl,
		);
		return this;
	}
}
