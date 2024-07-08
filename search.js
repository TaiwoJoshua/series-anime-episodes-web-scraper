const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const chalk = require("chalk");
const readline = require("readline");

function askQuestion(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(chalk.yellow(query), (answer) => {
      rl.close();
      if (answer === "EXIT") {
        process.exit(0);
      }
      resolve(answer);
    });
  });
}

async function option(max) {
  let choice;
  while (true) {
    try {
      console.log(
        chalk.green.italic("\nYou can visit each link for more information")
      );
      choice = await askQuestion(
        "Choose the title number that best suites your requirement: "
      );

      const x = parseInt(choice);
      if (x && x <= max && x > 0) {
        break;
      } else {
        console.log(
          chalk.red.italic(
            "Please choose a",
            chalk.bold("Title Number"),
            "number between 1 and",
            max,
            "\n"
          )
        );
      }
    } catch (error) {
      console.log(
        chalk.red.italic(
          "Invalid choice. Please choose a valid",
          chalk.bold("Title Number")
        )
      );
    }
  }

  return parseInt(choice);
}

async function searchNo() {
  let choice;
  while (true) {
    try {
      choice = await askQuestion(
        "How many search results do you want (max: 100): "
      );

      const x = parseInt(choice);
      if (x && x <= 100 && x > 0) {
        break;
      } else {
        console.log(
          chalk.red.italic("Please choose a number between 1 and 100\n")
        );
      }
    } catch (error) {
      console.log(
        chalk.red.italic("Please choose a number between 1 and 100\n")
      );
    }
  }

  return parseInt(choice);
}

async function search(article) {
  try {
    console.log(chalk.bold("\nWikipedia Search Begins\n"));
    const limit = await searchNo();

    const browser = await puppeteer.launch();

    // opening a new page and navigating to provided url(to be scraped).
    const page = await browser.newPage();

    // Fetch data for each season
    console.log("Fetching Links...");
    await page.goto(
      `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(
        article
      )}&limit=${limit}`
    );
    // wait for the contents inside specified element
    await page.waitForSelector("body");
    // Fetch HTML of the page we want to scrape
    const data = await page.content();

    console.log("Processing Links...\n");
    const $ = cheerio.load(data);
    const results = $(".searchResultImage");
    const items = [];
    if (results.length === 0) {
      const results = $(".firstHeading");
      const title = results.text();
      const link = "https://en.wikipedia.org/wiki/" + title.replace(/ /g, "_");
      console.log(chalk.bold(1), title, " => ", chalk.blue.underline(link));
      items.push({ title, link });
    } else {
      results.each(function (idx, res) {
        const targeted = $(res);
        const result = targeted.find("a");
        const title = result.text();
        const go = result.attr("href");
        const link = "https://en.wikipedia.org" + go;
        console.log(
          chalk.bold(idx + 1),
          title,
          " => ",
          chalk.blue.underline(link)
        );
        items.push({ title, link });
      });
    }

    const choice = await option(items.length);
    return items[choice - 1];
  } catch (error) {
    console.log(error);
    return { title: "", link: "" };
  }
}

module.exports = search;
