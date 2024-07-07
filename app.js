const PORT = 8000;
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

const main = require("./index.js");

app.get("/", function (req, res) {
  res.send("Happy web scraping");
});

app.listen(PORT, () => {
  // console.log("Server running on port " + PORT);
});

main();
