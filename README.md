# Image Search Engine

A modern image search application built with plain HTML, CSS, and JavaScript, backed by a small Node.js and Express proxy for Unsplash. The frontend stays framework-free, while the backend keeps the Unsplash access key out of the browser.

## Overview

This project helps users search and explore high-quality images with a polished vanilla JavaScript interface. It includes filters, recent search suggestions, favorites, collections, multi-select workflows, a canvas-based Collage Studio, theme support, accessibility improvements, and a lightweight backend proxy so sensitive API credentials are not exposed on the client.

## Features

- Image search powered by Unsplash
- Search filters for sort order, orientation, and color
- Search suggestions from Datamuse and recent local search history
- Infinite scrolling with `IntersectionObserver`
- Rich image details modal with metadata and quick actions
- Favorites saved in `localStorage`
- Named collections for organizing favorite images
- Multi-select mode for choosing images across results
- Collage Studio with downloadable canvas-generated layouts
- Light and dark theme support
- Persistent user preferences
- Skeleton loading states, empty states, and friendly error handling
- Keyboard accessibility improvements

## Tech Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js, Express
- External APIs:
  - Unsplash API
  - Datamuse API
- Client-side persistence:
  - `localStorage`

## Why the API Key Is Not in the Browser

Unsplash access keys should not be hardcoded into frontend JavaScript because anything shipped to the browser can be viewed by users. Moving Unsplash requests behind a backend proxy keeps the key in an environment variable on the server, which is much safer and more professional for a real project or portfolio repository.

## Project Structure

```text
image search/
|-- backend/
|   |-- package.json      # Backend dependencies and scripts
|   `-- server.js         # Express proxy server for Unsplash
|-- index.html            # Main application markup
|-- style.css             # Styles, themes, layout, and components
|-- script.js             # Frontend state, search, modal, favorites, collage logic
|-- .env.example          # Environment variable template
|-- .gitignore            # Ignored files such as .env and node_modules
`-- README.md             # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js 18 or newer
- An Unsplash developer access key

### Installation

1. Clone the repository.
2. Open the project folder.
3. Install backend dependencies:

```bash
cd backend
npm install
```

4. Create a `.env` file in the project root by copying `.env.example`.
5. Add your Unsplash access key to the `.env` file.

## API and Backend Configuration

The backend reads the Unsplash key from the environment and proxies frontend search requests through local API routes.

### Required Environment Variables

```env
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
PORT=3000
```

### Backend Endpoints

- `GET /api/search/photos`
- `GET /api/photos/random`

### What the Proxy Handles

- Reads query parameters from the frontend
- Validates incoming request parameters
- Sends server-side requests to Unsplash with the secret API key
- Returns JSON back to the frontend
- Handles missing key, invalid params, Unsplash failures, and network/server errors

## Running the Project Locally

Start the backend from the `backend` folder:

```bash
cd backend
npm start
```

Then open:

```text
http://localhost:3000
```

The Express server serves both the frontend files and the API proxy, so no separate frontend dev server is required.

## How the App Works

1. The user enters a search term in the frontend.
2. The frontend sends a request to `/api/search/photos`.
3. The Express backend validates the request and forwards it to Unsplash using the environment key.
4. The frontend receives the JSON response and renders the results.
5. Client-side features such as favorites, collections, preferences, and collage generation continue to work in the browser.

## Screenshots

Add screenshots here when you are ready to showcase the project on GitHub or in your portfolio.

Suggested placeholders:

- `Home Screen`
- `Search Results`
- `Image Details Modal`
- `Favorites and Collections`
- `Collage Studio`

Example markdown:

```md
![Home Screen](./screenshots/home.png)
![Search Results](./screenshots/results.png)
![Collage Studio](./screenshots/collage-studio.png)
```

## Future Improvements

- Add automated tests for backend routes and important frontend flows
- Improve collage customization with spacing, borders, and background options
- Add deployment instructions for Render, Railway, or Vercel
- Add toast notifications for key user actions
- Improve suggestion ranking and search analytics
- Add drag-and-drop reordering for selected images

## Notes

- The frontend remains plain HTML, CSS, and JavaScript.
- The Unsplash key is not stored in `script.js` or any other frontend file.
- The backend is intentionally small and beginner-friendly so the project stays easy to understand.
