import { SlashCommandBuilder } from "discord.js";

export const GetTaskCommand = new SlashCommandBuilder()
  .setName("task")
  .setDescription("Get a task from the bot")
  .addStringOption((option) =>
    option
      .setName("language")
      .setDescription("The language of the task")
      .addChoices(
        { name: "C#", value: "C#" },
        { name: "C++", value: "C++" },
        { name: "Java", value: "Java" },
        { name: "JavaScript", value: "JavaScript" },
        { name: "PHP", value: "PHP" },
        { name: "Python", value: "Python" },
        { name: "Ruby", value: "Ruby" },
        { name: "Swift", value: "Swift" }
      )
  )
  .addStringOption((option) =>
    option
      .setName("difficulty")
      .setDescription("The difficulty of the task")
      .addChoices(
        { name: "Very Easy", value: "Very Easy" },
        { name: "Easy", value: "Easy" },
        { name: "Medium", value: "Medium" },
        { name: "Hard", value: "Hard" },
        { name: "Very Hard", value: "Very Hard" },
        { name: "Expert", value: "Expert" }
      )
  )
  .toJSON();
