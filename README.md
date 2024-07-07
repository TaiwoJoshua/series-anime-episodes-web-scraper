# Series Anime Episodes Node Web Scraper

This project is a web scraper built in Node.js used to collect information about each episode of your desired series or anime from Wikipedia articles (https://en.wikipedia.org/). The technologies used include Express.js, Axios, Cheerio, and Puppeteer.

## Functionalities

The default information collected includes:

- No. overall (Episode Number Overall)
- No. in season (Episode Number)
- Season
- Title (English, Japanese, and Transliteration)
- Directed by
- Written by
- Animator(s)
- Original air date

There are two methods by which you can start the web scraping process:

1. Array
2. Search

### Array

This method can be used to fetch multiple series or animes at once. To use this method, update the `links` array in the `index.js` file. You need to provide the following for each series or anime:

- `title`: Title of the series or anime
- `link`: Link to the Wikipedia article you wish to scrape
- `headers`: An array of additional information you wish to extract from the table that is not included in the default information
- `excludes`: An array of information in the default information that you don't need
- `anime`: A boolean to ascertain whether it is a series or anime (true for anime, false for series)

If there are no additional `headers` or `excludes`, insert an empty array (`[]`).

Example:

```javascript
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
```

### Search

This method can be used to fetch one series or anime at a time. To use this method, you need to provide the same information as for the array method except for the link. After providing the necessary information, a list of links relating to your search will be provided, from which you select the one that best fits your requirements. The web scraping then begins.

#### Anime?

The purpose of the anime option is to allow the program to decide whether or not to extract other languages from the title, such as English, Japanese, and Transliteration. If you choose anime as false, the episode title as a whole will be used.

Example

```javascript
// Anime => No
{
"noOverall": "1",
"noInSeason": "1",
"title": "\"Enter: Naruto Uzumaki!\"Transliteration: \"Sanjō! Uzumaki Naruto\" (Japanese: 参上！うずまきナルト)",
"directedBy": "Hayato Date",
"writtenBy": "Katsuyuki Sumisawa",
"originalAirDate": "October 3, 2002 (2002-10-03)",
"season": "Season 1 (2002–03)"
}

// Anime => Yes
{
    "noOverall": "1",
    "noInSeason": "1",
    "title": "Enter: Naruto Uzumaki!",
    "directedBy": "Hayato Date",
    "writtenBy": "Katsuyuki Sumisawa",
    "originalAirDate": "October 3, 2002 (2002-10-03)",
    "english": "Enter: Naruto Uzumaki!",
    "japanese": "Sanjō! Uzumaki Naruto",
    "transliteration": "参上！うずまきナルト",
    "season": "Season 1 (2002–03)"
}
```

## Project Structure

The project is an Express.js application that uses Axios for making HTTP requests, Cheerio for parsing HTML, and Puppeteer for browser automation.

### Clone the Repository

#### `git clone https://github.com/TaiwoJoshua/series-anime-episodes-web-scraper.git`

### Navigate to the Project Directory

#### `cd series-anime-episodes-node-web-scraper`

### Install Dependencies

#### `npm install`

### Getting Started

Run npm start to use the application

#### `npm start`

### Output

After running the application, the data retrieved is stored both in JSON and XML files.

## Technologies Used

- Node.js
- Express.js
- Axios
- Cheerio
- Puppeteer

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Contact

For any questions or inquiries, please contact [joshuataiwo07@gmail.com].

Happy Web Scraping 🤗
