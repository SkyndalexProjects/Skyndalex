import type { SkyndalexClient } from "classes/Client";
import { StringSelectMenuBuilder as stringSelectMenuBuilder } from "discord.js";
export class StringSelectMenuBuilder extends stringSelectMenuBuilder {
	locale: string;
	constructor(
		private readonly client: SkyndalexClient,
		locale: string,
	) {
		super();
		this.locale = locale;
	}
	setPlaceholder(label: string): this {
		return super.setPlaceholder(
			this.client.i18n.t(label, { lng: this.locale }),
		);
	}
	addOptions(options: { label: string; value: string }[]): this {
		return super.addOptions(
			options.map((option) => ({
				label: this.client.i18n.t(option.label, { lng: this.locale }),
				value: option.value,
			})),
		);
	}
}
