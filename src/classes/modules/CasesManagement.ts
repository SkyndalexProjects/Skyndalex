import type { SkyndalexClient } from "../Client.js";
export class CaseManagement {
	constructor(private readonly client: SkyndalexClient) {
		this.client = client;
	}

	async add(
		guildId: string,
		userId: string,
		type: string,
		reason: string,
		moderatorId: string,
		duration?: string,
	) {
		const warnDate = new Date();
		const date = Date.parse(warnDate.toString());

		const newCase = await this.client.prisma.cases.create({
			data: {
				guildId: guildId,
				userId: userId,
				type: type,
				reason: reason,
				moderator: moderatorId,
				duration: duration,
				date: date / 1000,
				active: true,
			},
		});
		return newCase;
	}
	async remove(caseId: string) {
		await this.client.prisma.cases.update({
			where: {
				id: Number.parseInt(caseId),
			},
			data: {
				active: false,
			},
		});
	}
}
