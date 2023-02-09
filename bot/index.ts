import axios from "axios";
import {
  ActionRowBuilder,
  ButtonStyle,
  Client,
  ComponentType,
  Events,
  GatewayIntentBits,
  ModalBuilder,
  REST,
  Routes,
  TextInputBuilder,
  TextInputModalData,
  TextInputStyle,
} from "discord.js";
import { config } from "dotenv";
import { PingCommand, GetTaskCommand } from "./commands";

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
  if (interaction.isModalSubmit()) {
    await interaction.deferReply({ ephemeral: true });
    const solution = (
      interaction.fields.getField("solution") as TextInputModalData
    ).value;
    await interaction.editReply({ content: "```js\n" + solution + "\n```" });
    console.log(solution);
    const [, id, language] = interaction.customId.split(":");

    const res = await axios.post(
      "http://localhost:3000/api/submitSolution",
      {
        taskId: id,
        solution,
        isPython: language === "Python",
      },
      { timeout: 60000 }
    );
    console.log(res.data.message);
    await interaction.editReply({
      files: [Buffer.from(res.data.data.image, "base64")],
    });
  } else if (interaction.isButton()) {
    const [action, taskId, language] = interaction.customId.split(":");

    if (action === "write_solution") {
      const modal = new ModalBuilder()
        .setCustomId(`submit_solution:${taskId}:${language}`)
        .setTitle("Submit Solution");

      // Add components to modal

      const solutionInput = new TextInputBuilder()
        .setCustomId("solution")
        .setLabel("Write the solution below")
        // Paragraph means multiple lines of text.
        .setStyle(TextInputStyle.Paragraph);

      const secondActionRow = new ActionRowBuilder().addComponents(
        solutionInput
      );

      // Add inputs to the modal
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      modal.addComponents(secondActionRow);

      // Show the modal to the user
      await interaction.showModal(modal);
    }
  } else if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "ping") {
      console.log("hahaha");
      await interaction.reply("Pong!");
    }
    if (interaction.commandName === "task") {
      const language = interaction.options.getString("language");
      const difficulty = interaction.options.getString("difficulty");

      await interaction.deferReply();
      const taskResponse = await axios.get(
        "http://localhost:3000/api/randomTask",
        { params: { language, difficulty } }
      );
      const { taskId, image, startCode } = taskResponse.data;

      await interaction.editReply({ files: [Buffer.from(image, "base64")] });
      await interaction.followUp({
        content: "```js\n" + startCode + "\n```",
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Primary,

                customId: `write_solution:${taskId}:${language}`,
                label: "Solve",
              },
            ],
          },
        ],
      });
    }
  }
});

const main = async () => {
  const commands = [PingCommand, GetTaskCommand];
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
