import { SlashCommandBuilder } from "@discordjs/builders";

export const PingCommand = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!")
  .toJSON();
