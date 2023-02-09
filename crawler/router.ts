import { browser } from "./index";
import { Router } from "express";

const BASE_URL = "https://edabit.com";
const SHUFFLE_URL = `${BASE_URL}/shuffle`;

export default Router()
  .get("/randomTask", async (req, res) => {
    const { difficulty, language } = req.query;
    const page = await browser.newPage();
    await page.goto(SHUFFLE_URL);
    await page.waitForSelector(".ui.selection.dropdown");
    const selectors = await page.$$(".ui.selection.dropdown");
    const languageSelector = selectors[0];
    const difficultySelector = selectors[1];

    await languageSelector.click();
    const language_dropdown = await page.waitForSelector(
      ".visible.menu.transition"
    );

    //   const getAvaliableLanguages = async () => {
    //     return (await dropdown.evaluate(async (dropdown) => {
    //       return await new Promise((resolve) => {
    //         const innerList: string[] = [];
    //         dropdown.childNodes.forEach((node) =>
    //           innerList.push(node.firstChild.textContent)
    //         );
    //         resolve(innerList);
    //       });
    //     })) as Promise<string[]>;
    //   };

    const lang_options = await language_dropdown.$$("div.item");

    // const selectedLangOption = lang_options.find(async (option) => {
    //   const text = await option.evaluate(
    //     (option) => option.firstChild.textContent
    //   );
    //   console.log(text, language);
    //   return text === language;
    // });
    // await selectedLangOption.click();

    for (const option of lang_options) {
      const text = await option.evaluate(
        (option) => option.firstChild.textContent
      );
      if (text === language) {
        await option.click();
      }
    }

    await difficultySelector.click();
    await page.screenshot({ path: "d.png" });

    const difficulty_dropdown = await page.waitForSelector(
      ".visible.menu.transition"
    );

    const diff_options = await difficulty_dropdown.$$("div.item");

    // const selectedDiffOption = diff_options.find(async (option) => {
    //   const text = await option.evaluate(
    //     (option) => option.firstChild.textContent
    //   );
    //   console.log(text, difficulty);
    //   return text === difficulty;
    // });

    // await selectedDiffOption.click();
    for (const option of diff_options) {
      const text = await option.evaluate(
        (option) => option.firstChild.textContent
      );
      if (text === difficulty) {
        await option.click();
      }
    }
    await Promise.all([
      page.waitForNavigation(),
      page.click(".ui.green.huge.fluid.button"),
    ]);
    await page.waitForSelector(".grey-segment.code-area.instructions");
    const task = await page.$(".grey-segment.code-area.instructions");
    const taskId = await page.url().split("/").pop();
    const image = await task.screenshot({ encoding: "base64" });
    const [, codeTab] = await page.$$(".rc-tabs-tab");
    await codeTab.click();
    await page.waitForSelector(".CodeMirror-code");
    const startCodeElement = await page.$$(".CodeMirror-line ");
    const startCode = await Promise.all(
      startCodeElement.map(async (el) => {
        return await el.evaluate((el) => el.textContent);
      })
    );
    await page.screenshot({ path: "example.png" });

    await page.close();
    res
      .status(200)
      .json({ image, taskId, startCode: joinTextArrayToEditorCode(startCode) });
  })
  .post("/checkTask", async (req, res) => {
    const { taskId, code } = req.body;
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/challenge/${taskId}`);
    await page.waitForSelector(".grey-segment.code-area.instructions");
    const codeTab = await page.$$(".rc-tabs-tab");
    await codeTab[1].click();
    await page.waitForSelector(".CodeMirror-code");
    const codeMirror = await page.$(".CodeMirror-code");
    await codeMirror.evaluate((codeMirror, code) => {
      codeMirror.textContent = code;
    }, code);
    await page.click(".ui.green.large.right.floated.button");
    await page.screenshot({ path: "exampleResponse.png" });
    await page.close();
    res.status(200).json({ message: "ok" });
  });

function joinTextArrayToEditorCode(textArray: string[]) {
  const editorCode = textArray.map((line, index) => {
    if (index === 0) return line;
    return `  ${line}`;
  }).join(`

`);
  return editorCode;
}
