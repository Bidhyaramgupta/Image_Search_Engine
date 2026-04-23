# Image Search Engine

This project is a plain HTML, CSS, and JavaScript image search app with a small Node.js + Express backend that proxies Unsplash requests. The frontend no longer stores the Unsplash API key.

## Prerequisites

- Node.js 18 or newer
- An Unsplash access key

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root by copying `.env.example`.

3. Add your Unsplash access key:

```env
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
PORT=3000
```

## Run locally

```bash
npm start
```

Then open `http://localhost:3000`.

## How it works

- The frontend calls `/api/search/photos` for image search.
- The frontend calls `/api/photos/random` for fallback images.
- The Express server adds the Unsplash authorization header using `UNSPLASH_ACCESS_KEY`.
- Static frontend files are served by the same Express app, so the project stays simple to run.
