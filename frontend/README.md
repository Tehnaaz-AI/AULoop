# AULoop Frontend

This directory contains the React application for the AULoop marketplace, powered by Vite.

## Architecture
- **Framework:** React + Vite for fast build times and hot module replacement.
- **Routing:** `react-router-dom` is used for SPA navigation. The `/src/App.jsx` file handles all protected and public routes.
- **State Management:** A lightweight global store is managed via Zustand (`/src/store/useStore.js`).
- **Contexts:**
  - `AuthContext`: Manages the global authenticated user state.
  - `UiContext`: Manages UI notifications, toasts, and alerts.
- **Styling:** Fully responsive, dark-mode compatible design system built with custom Tailwind CSS utilities.

## Environment Variables
Before running the frontend, ensure you have a `.env` file configured. **Do not commit your `.env` file to version control.**

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Scripts
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the production-ready static application.
- `npm run preview`: Locally previews the production build.
