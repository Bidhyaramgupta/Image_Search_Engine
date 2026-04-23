const express = require("express");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const UNSPLASH_API_BASE = "https://api.unsplash.com";
const SEARCH_ALLOWED_PARAMS = new Set([
  "page",
  "query",
  "per_page",
  "order_by",
  "orientation",
  "color"
]);
const RANDOM_ALLOWED_PARAMS = new Set(["count", "query", "orientation"]);
const VALID_ORDER_BY = new Set(["relevant", "latest"]);
const VALID_ORIENTATION = new Set(["landscape", "portrait", "squarish"]);
const VALID_COLORS = new Set([
  "black_and_white",
  "black",
  "white",
  "yellow",
  "orange",
  "red",
  "purple",
  "magenta",
  "green",
  "teal",
  "blue"
]);

app.use(express.static(FRONTEND_ROOT));

function sendJsonError(res, status, error, details) {
  const payload = { error };
  if (details) payload.details = details;
  return res.status(status).json(payload);
}

function requireUnsplashKey(req, res, next) {
  if (!UNSPLASH_ACCESS_KEY) {
    return sendJsonError(
      res,
      500,
      "Missing UNSPLASH_ACCESS_KEY.",
      "Create a .env file from .env.example and add your Unsplash access key."
    );
  }

  return next();
}

function trimString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validatePage(value) {
  if (!value) return null;
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1 || page > 1000) {
    return "The \"page\" parameter must be an integer between 1 and 1000.";
  }
  return null;
}

function validatePerPage(value) {
  if (!value) return null;
  const perPage = Number(value);
  if (!Number.isInteger(perPage) || perPage < 1 || perPage > 30) {
    return "The \"per_page\" parameter must be an integer between 1 and 30.";
  }
  return null;
}

function validateCount(value) {
  if (!value) return null;
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1 || count > 30) {
    return "The \"count\" parameter must be an integer between 1 and 30.";
  }
  return null;
}

function validateSearchParams(query) {
  const cleaned = new URLSearchParams();
  const queryText = trimString(query.query);
  if (!queryText) {
    return { error: "The \"query\" parameter is required." };
  }

  cleaned.set("query", queryText);

  const pageError = validatePage(trimString(query.page));
  if (pageError) return { error: pageError };
  if (trimString(query.page)) cleaned.set("page", trimString(query.page));

  const perPageError = validatePerPage(trimString(query.per_page));
  if (perPageError) return { error: perPageError };
  if (trimString(query.per_page)) cleaned.set("per_page", trimString(query.per_page));

  const orderBy = trimString(query.order_by);
  if (orderBy) {
    if (!VALID_ORDER_BY.has(orderBy)) {
      return { error: "The \"order_by\" parameter must be either \"relevant\" or \"latest\"." };
    }
    cleaned.set("order_by", orderBy);
  }

  const orientation = trimString(query.orientation);
  if (orientation) {
    if (!VALID_ORIENTATION.has(orientation)) {
      return { error: "The \"orientation\" parameter is invalid." };
    }
    cleaned.set("orientation", orientation);
  }

  const color = trimString(query.color);
  if (color) {
    if (!VALID_COLORS.has(color)) {
      return { error: "The \"color\" parameter is invalid." };
    }
    cleaned.set("color", color);
  }

  return { params: cleaned };
}

function validateRandomParams(query) {
  const cleaned = new URLSearchParams();

  const countError = validateCount(trimString(query.count));
  if (countError) return { error: countError };
  if (trimString(query.count)) cleaned.set("count", trimString(query.count));

  const queryText = trimString(query.query);
  if (queryText) cleaned.set("query", queryText);

  const orientation = trimString(query.orientation);
  if (orientation) {
    if (!VALID_ORIENTATION.has(orientation)) {
      return { error: "The \"orientation\" parameter is invalid." };
    }
    cleaned.set("orientation", orientation);
  }

  return { params: cleaned };
}

function filterUnexpectedParams(query, allowedParams) {
  const unexpected = Object.keys(query).filter((key) => !allowedParams.has(key));
  return unexpected.length ? unexpected : null;
}

async function fetchUnsplash(endpoint, params) {
  let response;

  try {
    response = await fetch(`${UNSPLASH_API_BASE}${endpoint}?${params.toString()}`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1"
      }
    });
  } catch (error) {
    error.kind = "network";
    throw error;
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(`Unsplash request failed with status ${response.status}.`);
    error.status = response.status;
    error.details = payload?.errors || payload?.error || payload || null;
    throw error;
  }

  return payload;
}

app.get("/api/search/photos", requireUnsplashKey, async (req, res) => {
  const unexpected = filterUnexpectedParams(req.query, SEARCH_ALLOWED_PARAMS);
  if (unexpected) {
    return sendJsonError(
      res,
      400,
      "Invalid search request parameters.",
      `Unexpected parameter(s): ${unexpected.join(", ")}`
    );
  }

  const { params, error } = validateSearchParams(req.query);
  if (error) return sendJsonError(res, 400, "Invalid search request.", error);

  try {
    const data = await fetchUnsplash("/search/photos", params);
    return res.json(data);
  } catch (requestError) {
    const status = requestError.kind === "network" ? 502 : requestError.status || 500;
    return sendJsonError(
      res,
      status,
      requestError.message || "Failed to load search results from Unsplash.",
      requestError.details
    );
  }
});

app.get("/api/photos/random", requireUnsplashKey, async (req, res) => {
  const unexpected = filterUnexpectedParams(req.query, RANDOM_ALLOWED_PARAMS);
  if (unexpected) {
    return sendJsonError(
      res,
      400,
      "Invalid random photo request parameters.",
      `Unexpected parameter(s): ${unexpected.join(", ")}`
    );
  }

  const { params, error } = validateRandomParams(req.query);
  if (error) return sendJsonError(res, 400, "Invalid random photo request.", error);

  if (!params.has("count")) params.set("count", "12");

  try {
    const data = await fetchUnsplash("/photos/random", params);
    return res.json(data);
  } catch (requestError) {
    const status = requestError.kind === "network" ? 502 : requestError.status || 500;
    return sendJsonError(
      res,
      status,
      requestError.message || "Failed to load random photos from Unsplash.",
      requestError.details
    );
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_ROOT, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Image Search app running at http://localhost:${PORT}`);
});
