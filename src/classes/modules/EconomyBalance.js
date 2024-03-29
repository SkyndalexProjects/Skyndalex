const cooldowns = new Map();

export default class EconomyBalance {
    constructor(client) {
        this.client = client;
    }
    async updateWallet(interaction, userId, amount) {
        try {
            const user = await this.client.prisma.economy.findFirst({
                where: { uid: interaction.user.id }
            });

            const updateUser = await this.client.prisma.economy.upsert({
                where: {
                    uid_guildId: {
                        guildId: interaction.guild.id,
                        uid: interaction.user.id
                    }
                },
                create: {
                    guildId: interaction.guild.id,
                    uid: interaction.user.id,
                    wallet: amount.toString()
                },
                update: { wallet: (parseInt(user?.wallet || '0') + amount).toString() }
            });

            if (!updateUser) return interaction.reply('Failed to update wallet');
            return updateUser;
        } catch (error) {
            console.error(error);
        }
    }
}
