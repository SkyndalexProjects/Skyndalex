import type { SkyndalexClient } from "classes/Client";
import { TextInputBuilder as textInputBuilder } from "discord.js";
export class TextInputBuilder extends textInputBuilder {
	locale: string;
	constructor(
		private readonly client: SkyndalexClient,
		locale: string,
	) {
		super();
		this.locale = locale;
	}
	setLabel(label: string): this {
		return super.setLabel(this.client.i18n.t(label, { lng: this.locale }));
	}
	setPlaceholder(placeholder: string): this {
		return super.setPlaceholder(
			this.client.i18n.t(placeholder, { lng: this.locale }),
		);
	}
}
