const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

app.use(express.static(path.join(__dirname)));

function requireUnsplashKey(req, res, next) {
  if (!UNSPLASH_ACCESS_KEY) {
    return res.status(500).json({
      error: "Missing UNSPLASH_ACCESS_KEY. Add it to your .env file."
    });
  }

  next();
}

async function fetchUnsplash(url) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      "Accept-Version": "v1"
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Unsplash request failed (${response.status})`);
    error.status = response.status;
    error.details = errorText;
    throw error;
  }

  return response.json();
}

app.get("/api/search/photos", requireUnsplashKey, async (req, res) => {
  try {
    const params = new URLSearchParams();
    const allowedParams = ["page", "query", "per_page", "order_by", "orientation", "color"];

    allowedParams.forEach((key) => {
      const value = req.query[key];
      if (typeof value === "string" && value.trim()) {
        params.set(key, value.trim());
      }
    });

    const url = `https://api.unsplash.com/search/photos?${params.toString()}`;
    const data = await fetchUnsplash(url);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || "Failed to load search results.",
      details: error.details
    });
  }
});

app.get("/api/photos/random", requireUnsplashKey, async (req, res) => {
  try {
    const params = new URLSearchParams();
    const count = typeof req.query.count === "string" && req.query.count.trim()
      ? req.query.count.trim()
      : "12";

    params.set("count", count);

    const url = `https://api.unsplash.com/photos/random?${params.toString()}`;
    const data = await fetchUnsplash(url);
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || "Failed to load fallback photos.",
      details: error.details
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Image Search app running at http://localhost:${PORT}`);
});
