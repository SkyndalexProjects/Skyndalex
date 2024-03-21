export default class CooldownHandler {
  constructor(client) {
    this.client = client;
  }
  async set(command, guildId, timeInSec, userId) {
    try {
      const cooldowns = await this.client.prisma.guildCooldowns.findMany({
        where: {
          guildId: guildId,
          commandName: command,
          uid: userId,
        },
      })

      const endTimestamp = Number(cooldowns[0]?.endTimestamp)

      if (cooldowns?.length > 0 && endTimestamp >= Date.now() ) {
        const remaining = endTimestamp / 1000 - Date.now() / 1000
        console.log("remaining", remaining)
        return remaining
      } else {
        await this.client.prisma.guildCooldowns.upsert({
          where: {
            uid_guildId_commandName: {
              guildId: guildId,
              commandName: command,
              uid: userId,
            } },
          create: {
            guildId: guildId,
            uid: userId,
            commandName: command,
            endTimestamp: String(Date.now() + timeInSec * 1000)
          },
          update: {
            endTimestamp: String(Date.now() + timeInSec * 1000)
          },
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
}
