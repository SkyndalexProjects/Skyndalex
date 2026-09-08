import { AttachmentBuilder } from "discord.js";

export abstract class CanvasRenderer<TOptions> {
	public abstract render(options: TOptions): Promise<Buffer>;

	public async createAttachment(
		options: TOptions,
		name: string,
	): Promise<AttachmentBuilder> {
		const buffer = await this.render(options);

		return new AttachmentBuilder(buffer, {
			name,
		});
	}
}
