// Importing modules
const express = require("express");
const validUrl = require("valid-url");
const shortId = require("short-id");

// Import database pool
const db = require("./db");

const app = express();
app.use(express.json({}));

// Our API base URL
const baseUrl = "http://localhost:4000/";

// Endpoint for creating the url
app.post("/", async (req, res) => {
  // Destructuring the long URL
  const { longUrl } = req.body;

  // Generating URL code, which will be added to the base URL
  const urlCode = shortId.generate();
  try {
    // Checking if the base URL is valid
    if (!validUrl.isUri(baseUrl)) {
      return res.status(401).json({ msg: "invalid base url" });
    }

    // Checking if the long URL is valid
    if (validUrl.isUri(longUrl)) {
      let url = `SELECT shorturl FROM urls WHERE longurl = $1`; // query string to find if it exists

      let urlExists = await db.query(url, [longUrl]);
      // If it exists, send it back
      if (urlExists.rows === 0) {
        return res.status(200).json(urlExists);
      } else {
        // else create one by concating the base URL with generated short URL code
        const shortUrl = `${baseUrl}${urlCode}`;

        // Inserting all to the db
        let query =
          "INSERT INTO urls (longurl, shorturl, urlcode) VALUES ($1, $2, $3) RETURNING shorturl";

        await db.query(query, [longUrl, shortUrl, urlCode]);

        return res.status(200).json(shortUrl);
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "an error occured" });
  }
});

// Redirecting endpoint
app.get("/:code", async (req, res) => {
  try {
    const queryStr = "SELECT longurl FROM urls WHERE urlcode = $1";
    const query = await db.query(queryStr, [req.params.code]);

    let result = Object.values(query.rows[0]); // getting the value from query result

    if (query.rowCount > 0) {
      return res.redirect(result);
    } else {
      return res.status(404).json({ msg: "URL not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "an error occured" });
  }
});

app.listen(4000, () => {
  console.log("App running on port 4000");
});
