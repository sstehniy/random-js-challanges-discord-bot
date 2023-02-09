import { browser } from "./index";
import { Router } from "express";
import { Page } from "puppeteer";

const BASE_URL = "https://edabit.com";
const SHUFFLE_URL = `${BASE_URL}/shuffle`;

const login = async (page: Page) => {
  const tab = await page.$(".ui.big.tabular.menu  a.item");
  await tab.click();
  await page.type("input[name='email']", "sstehniy@gmail.com");
  await page.click("input[name='password']");
  await page.type("input[name='password']", "Buyua123+");

  await page.click(".ui.green.big.fluid.button"),
    await page.waitForNetworkIdle();
};

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
  .post("/submitSolution", async (req, res) => {
    const { taskId, solution } = req.body;
    const page = await browser.newPage();
    console.log(taskId, solution);
    await page.goto(`${BASE_URL}/challenge/${taskId}`);
    await page.waitForSelector(".grey-segment.code-area.instructions");
    const codeTab = await page.$$(".rc-tabs-tab");
    await codeTab[1].click();
    console.log("here 1");
    await page.waitForSelector(".CodeMirror-code");
    console.log("here 2");

    const codeMirror = await page.$(".CodeMirror-code");
    console.log("here 3");

    await codeMirror.type(solution);
    console.log("here 4");

    await page.click(".ui.green.large.right.floated.button");
    console.log("here 5");
    const loginModal = await page.$(
      ".ui.small.modal.transition.visible.active.error-shake"
    );

    await page.screenshot({ path: "before.png" });

    if (loginModal) {
      console.log("here 6");
      await login(page);
    }
    await page.screenshot({ path: "after.png" });

    const output = await page.$(".console-segment.custom-bullets");
    await output.screenshot({ path: "output.png" });
    const image = await output.screenshot({ encoding: "base64" });
    await page.close();
    res.status(200).json({ message: "ok", data: { image } });
  });

function joinTextArrayToEditorCode(textArray: string[]) {
  const editorCode = textArray.map((line, index) => {
    if (index === 0) return line;
    return `  ${line}`;
  }).join(`

`);
  return editorCode;
}
