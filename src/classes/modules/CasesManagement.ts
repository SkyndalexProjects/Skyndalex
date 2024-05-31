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
		const newCase = await this.client.prisma.cases.create({
			data: {
				guildId: guildId,
				userId: userId,
				type: type,
				reason: reason,
				moderator: moderatorId,
				duration: duration,
			},
		});
		return newCase;
	}
	async remove(caseId: string) {
		await this.client.prisma.cases.delete({
			where: {
				id: Number.parseInt(caseId),
			},
		});
	}
}
