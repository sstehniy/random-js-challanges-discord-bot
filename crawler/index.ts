import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, executablePath } from "puppeteer";
import express from "express";
import cors from "cors";
import router from "./router";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

puppeteer.use(StealthPlugin());

export let browser!: Browser;

process.on("beforeExit", () => {
  if (!browser) return;
  browser.close();
});

const startBrowser = async () => {
  browser = await puppeteer.launch({
    executablePath: executablePath(),
    args: ["--no-sandbox"],
    headless: true,
    defaultViewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });
};

app.use("/api", router);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
  startBrowser();
});
