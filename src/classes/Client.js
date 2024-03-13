import { Client } from "discord.js";
import CooldownHandler from "./CooldownHandler.js";
import EconomyBalance from "./EconomyBalance.js";
import GetRandomSentences from "./GetRandomSentences.js";
import { Connectors, Shoukaku } from "shoukaku";
export default class Base extends Client {
  constructor(options) {
    super(options);
    const Nodes = [
      {
        name: "Localhost",
        url: "127.0.0.1:6969",
        auth: "youshallnotpass",
      },
    ];

    const shoukaku = new Shoukaku(new Connectors.DiscordJS(this), Nodes);
    shoukaku.on("error", (_, error) => console.error(error));


    this.economyBalance = new EconomyBalance(this);
    this.sentences = new GetRandomSentences(this);
    this.cooldowns = new CooldownHandler(this);

    this.shoukaku = shoukaku;
  }
}
