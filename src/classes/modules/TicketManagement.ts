import type { SkyndalexClient } from "../Client.js";
export class TicketManagement {
	constructor(private readonly client: SkyndalexClient) {
		this.client = client;
	}

	async create(
		ticketId: number,
		guildId: string,
		userId: string,
		ticketChannelId: string,
		ticketCategory: string,
		state: string,
	) {
		const ticket = await this.client.prisma.tickets.create({
			data: {
				id: ticketId,
				userId,
				guildId,
				ticketChannel: ticketChannelId,
				ticketCategory,
				state,
			},
		});

		return ticket;
	}
	async delete(
		guildId: string,
		ticketId: number,
		ticketChannelId: string,
		userId: string,
	) {
		const ticket = await this.client.prisma.tickets.delete({
			where: {
				guildId_userId_id: {
					guildId,
					id: ticketId,
					userId,
				},
			},
		});

		await this.client.channels.cache.get(ticketChannelId).delete();

		return ticket;
	}
    async archive(
        guildId: string,
        userId: string,
        ticketId: number,
    ) {
        const ticket = await this.client.prisma.tickets.update({
            where: {
                guildId_userId_id: {
                    guildId,
                    id: ticketId,
                    userId,
                },
            },
            data: {
                state: "archived",
            },
        });

        return ticket;
    }
}
