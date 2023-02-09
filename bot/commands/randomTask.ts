import { SlashCommandBuilder } from "@discordjs/builders";

export const RandomTaskCommand = new SlashCommandBuilder()
  .setName("random-task")
  .setDescription("Sends a random coding challange")
  .addStringOption((option) => {
    return option
      .setName("language")
      .setDescription("The programming language to use")
      .addChoices(
        { name: "JavaScript", value: "js" },
        { name: "Python", value: "py" },
        { name: "C++", value: "cpp" }
      );
  })
  .addStringOption((option) => {
    return option
      .setName("difficulty")
      .setDescription("Difficulty of the task")
      .addChoices(
        { name: "Easy", value: "easy" },
        { name: "Medium", value: "medium" },
        { name: "Hard", value: "hard" },
        { name: "Very Hard", value: "very-hard" }
      );
  })
  .toJSON();
