const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const fs = require("fs");
const { create } = require("xmlbuilder2");

const defaultData = {
  anime: false,
  headers: [
    "No.",
    "No. overall",
    "No. in season",
    "Season",
    "Title",
    "Directed by",
    "Written by",
    "Original air date",
  ],
};

function cleanFileName(fileName) {
  // Remove special characters except for underscore and hyphen
  let cleanedName = fileName.replace(/[^\w\s.-]/g, "");

  // Replace spaces with underscores
  cleanedName = cleanedName.replace(/\s+/g, "_");

  return cleanedName;
}

function toCamelCase(sentence) {
  // Split the sentence into words using any non-alphanumeric character as a delimiter
  const words = sentence.split(/[^a-zA-Z]+/).filter(Boolean); // The filter(Boolean) removes empty strings
  // const words = sentence.split(/[^a-zA-Z0-9]+/).filter(Boolean); // The filter(Boolean) removes empty strings

  if (words.length === 0) {
    return "";
  }

  // Process the first word (convert to lowercase)
  const camelCaseWords = [words[0].toLowerCase()];

  // Process subsequent words (capitalize first letter and convert rest to lowercase)
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const camelCaseWord =
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    camelCaseWords.push(camelCaseWord);
  }

  // Join all words into a single string
  return camelCaseWords.join("");
}

function generateXML(dataArray) {
  const xmlItems = dataArray.map((item) => {
    return create({
      episodes: {
        episode: {
          "@number": item.episode,
          ...item,
        },
      },
    }).end({ prettyPrint: true });
  });
  let data = xmlItems.join("\n");

  // remove repeated tags
  data = data.replace(/<\?xml version="1.0"\?>\n/g, "");
  data = data.replace(/<episodes>\n/g, "");
  data = data.replace(/<\/episodes>\n/g, "");
  data = data.replace(/<\/episodes>/g, "");
  return data;
}

function processData(data, info, fileName) {
  console.log("Processing Data...");
  const $ = cheerio.load(data);
  const seasons = $("h3 > span:nth-child(2)");

  const tables = $("table.wikitable.wikiepisodetable>tbody");
  const items = [];
  tables.each(function (tidx, table) {
    const indexes = {};
    const targeted = $(table);
    const headsTr = targeted.find("tr:nth-child(1)");
    const headsTh = headsTr.children();

    headsTh.each(function (idx, head) {
      let h = $(head).text();
      h = toCamelCase(h);
      info.headers.map((header) => {
        let head = toCamelCase(header);
        if (head.toLowerCase() === h.toLowerCase()) {
          indexes[head] = idx;
        }
        return header;
      });
    });

    const rows = targeted.find("tr.vevent.module-episode-list-row");
    rows.each(function (idx, row) {
      const target = $(row);

      let scraped = {};
      let tds = target.children();
      const gets = Object.keys(indexes);
      for (let f = 0; f < gets.length; f++) {
        const get = gets[f];
        scraped[get] = $(tds[indexes[get]]).text().trim();
      }

      // Extract English, Japanese and Transliterations Parts from Title
      if (info.anime && scraped.title) {
        let title = scraped.title;
        let english, japanese, transliteration;
        if (
          title.indexOf("Transliteration: ") !== -1 &&
          title.indexOf(" (Japanese: ") !== -1
        ) {
          const split = title.split("Transliteration: ");
          english = split[0].slice(1, split[0].length - 1);
          const splitt = split[1].split(" (Japanese: ");
          japanese = splitt[0].slice(1, splitt[0].length - 1);
          transliteration = splitt[1].slice(0, splitt[1].length - 1);
        } else if (title.indexOf("Transliteration: ") !== -1) {
          const split = title.split("Transliteration: ");
          english = split[0].slice(1, split[0].length - 1);
          transliteration = split[1].slice(0, split[1].length - 1);
        } else if (title.indexOf(" (Japanese: ") !== -1) {
          const split = title.split(" (Japanese: ");
          english = split[0].slice(1, split[0].length - 1);
          japanese = split[1].slice(0, split[1].length - 1);
        } else {
          english = title;
        }
        scraped = {
          ...scraped,
          english,
          japanese,
          transliteration,
          title: english || transliteration || japanese,
        };
      }

      if (info.headers.includes("Season")) {
        const season = seasons[tidx];
        scraped.season = season ? $(season).text() : undefined;
      }
      items.push(scraped);
    });
  });

  console.log("Saving Data...");
  // Save as JSON
  fs.writeFile(
    `./data/${cleanFileName(fileName)}.json`,
    JSON.stringify(items, null, 2),
    (err) => {
      if (err) {
        console.error(err);
        return;
      }
      // console.log("JSON file has been saved");
    }
  );

  // Save as XML
  const xmlData = generateXML(items);

  fs.writeFile(
    `./data/${cleanFileName(fileName)}.xml`,
    `<?xml version="1.0" encoding="utf-8"?>\n<episodes>\n${xmlData}</episodes>`,
    (err) => {
      if (err) throw err;
      // console.log("XML file has been saved!");
    }
  );
}

async function scraper(links = []) {
  for (let p = 0; p < links.length; p++) {
    const curr = links[p];
    const { title, link, anime, headers, excludes } = curr;

    defaultData.anime = anime;
    defaultData.headers = defaultData.headers.filter(
      (head) => !excludes.includes(head)
    );
    defaultData.headers = Array.from(
      new Set([...headers, ...defaultData.headers])
    );

    const browser = await puppeteer.launch();
    console.log("\n\n===================================================\n");
    console.log(`Starting ${title} Web Scraping...`);
    console.log("\n===================================================\n");

    // opening a new page and navigating to provided url(to be scraped).
    const page = await browser.newPage();

    // Fetch data for each season
    console.log("Fetching Data...");
    await page.goto(link);
    // wait for the contents inside specified element
    await page.waitForSelector("body");
    // Fetch HTML of the page we want to scrape
    const data = await page.content();

    // pass data to processData(function) for further processing using cheerio;
    processData(data, defaultData, title);

    console.log("\n===================================================\n");
    console.log(`Completed ${title} Web Scraping 👍`);
    console.log("\n===================================================\n");

    await browser.close(); // Close the browser once done
  }
}

module.exports = { scraper, defaultData };
