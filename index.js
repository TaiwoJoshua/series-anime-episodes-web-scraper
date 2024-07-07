const readline = require("readline");
const chalk = require("chalk");
const { scraper, defaultData } = require("./scraper");
const search = require("./search");

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

async function option() {
  let choice;
  while (true) {
    console.log(
      chalk.bgBlue.white(
        `\n Ensure you have read the ${chalk.bold(
          "README.md"
        )} file before continuing \n`
      )
    );
    console.log(chalk.bold("How do you wish to access the Wikipedia Article?"));
    console.log(chalk.blue("1. Array \t 2. Search \n"));

    choice = await askQuestion("Enter your choice (1 or 2): ");

    if (choice === "1" || choice === "2") {
      break;
    } else {
      console.log(chalk.red.italic("Invalid choice. Please enter 1 or 2."));
    }
  }

  return choice;
}

async function details(headers) {
  console.log(chalk.bold("\nSupply the following information to begin."));
  const title = await askQuestion("Title: ");
  let anime = await askQuestion("Is this a Series or an Anime (1 or 2): ");
  while (anime && anime.toLowerCase() !== "1" && anime.toLowerCase() !== "2") {
    anime = await askQuestion("Is this a Series or an Anime (1 or 2): ");
  }
  anime = anime.toLowerCase() === "2" ? true : false;

  const header = [];
  const exclude = [];
  console.log(
    chalk.bold(
      "\nBelow are the default informations that would be fetched if available"
    )
  );
  console.log(chalk.blue(headers.join(", ")));
  console.log(
    chalk.bold("\nEnter other informations you might want to include")
  );
  let head = true;
  while (head) {
    console.log(chalk.green.italic("Click", chalk.bold("Enter"), "to Contine"));
    head = await askQuestion("Include: ");
    if (head) header.push(head);
  }

  console.log(
    "Enter the informations you wish to exclude from the default informations"
  );
  let remove = true;
  while (remove) {
    console.log(chalk.green.italic("Click", chalk.bold("Enter"), "to Contine"));
    remove = await askQuestion("Exclude: ");
    if (remove) exclude.push(remove);
  }

  console.log(chalk.green.bold("\nData Collection Completed"));

  return {
    title,
    anime,
    headers: header,
    excludes: exclude,
  };
}

async function again() {
  let another = await askQuestion(
    "Would you like to find another movie (Yes or No): "
  );
  while (
    another &&
    another.toLowerCase() !== "yes" &&
    another.toLowerCase() !== "no"
  ) {
    another = await askQuestion(
      "Would you like to find another movie (Yes or No): "
    );
  }
  another = another.toLowerCase() === "yes" ? true : false;

  return another;
}

async function main() {
  try {
    const links = [
      {
        title: "Naruto",
        link: "https://en.wikipedia.org/wiki/List_of_Naruto_episodes",
        headers: ["Animation directed by", "English air date"],
        anime: true,
        excludes: ["No. in season"],
      },
      {
        title: "Game of Thrones",
        link: "https://en.wikipedia.org/wiki/List_of_Game_of_Thrones_episodes",
        headers: ["U.S. viewers (millions)"],
        anime: false,
        excludes: [],
      },
    ];

    console.log(
      chalk.bgGrey.bold.white(
        "\n Series / Anime Episodes Web Scraper from Wikipedia "
      )
    );
    console.log(chalk.bgGrey.bold.white(" Developed by Taiwo Joshua "));
    console.log(
      chalk.italic(
        "Visit",
        chalk.blue.underline("https://taiwojoshua.netlify.app/"),
        "to learn more about me\n"
      )
    );

    console.log(
      chalk.bgRed(
        " You can type the",
        chalk.bold("EXIT"),
        "keyword anytime to end execution "
      )
    );

    const choice = await option();

    if (choice === "1") {
      await scraper(links);
    } else if (choice === "2") {
      let loop = true;
      while (loop) {
        const { title, headers, excludes, anime } = await details(
          defaultData.headers
        );

        const { link } = await search(`list of ${title} episodes`);
        const data = [
          {
            title,
            link,
            headers,
            anime,
            excludes,
          },
        ];
        await scraper(data);
        loop = await again();
      }
    } else {
    }
    process.exit(0);
  } catch (error) {
    console.log(error);
  }
}

module.exports = main;
