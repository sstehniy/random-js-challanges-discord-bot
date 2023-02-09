import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import { config } from "dotenv";
import { PingCommand } from "./commands";

config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN || ""
);

client.on("ready", (client) => {
  console.log(`Ready! Logged in as ${client.user?.tag}!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    console.log("hahaha");
    await interaction.reply("Pong!");
  }
});

const main = async () => {
  const commands = [PingCommand];
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID || "",
        process.env.DISCORD_GUILD_ID || ""
      ),
      {
        body: commands,
      }
    );
    client.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    console.log(error);
  }
};

main();
