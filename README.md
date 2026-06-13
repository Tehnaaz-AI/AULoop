# AULoop - Verified Campus Resale

AULoop is an exclusive, hyper-local marketplace designed specifically for university campuses. It allows students to securely buy and sell items like textbooks, electronics, and lab gear directly with their peers. Built with trust in mind, AULoop ensures all users are verified students and provides features like integrated chat, video reels, and a handover OTP system to prevent scams.

## Key Features

- **Campus Exclusive:** Only verified students can access the marketplace.
- **Interactive Reels:** Swipe-style product video previews to showcase items effectively.
- **Secure Handover:** OTP-based verification for completed sales.
- **Built-in Chat:** Real-time messaging between buyers and sellers.
- **Trust Scores:** Gamified seller reputation system based on completed sales and reviews.
- **Campus Radar:** A dedicated Lost & Found section.

## Tech Stack

The application is built using the **MERN** stack:
- **MongoDB:** Database for storing users, listings, and chats.
- **Express & Node.js:** Robust backend API and real-time socket server.
- **React:** Modern, dynamic frontend interface.
- **Tailwind CSS:** Fully custom, utility-first styling for a beautiful UI.

## Project Structure

This is a monorepo containing both the frontend and backend:

- `/frontend` - The React Vite application.
- `/backend` - The Node.js Express API.

## Quick Start

### 1. Backend Setup
Navigate to the `backend` directory, install dependencies, and start the development server. Ensure you have your `.env` configured (see the backend README for variables).

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
Navigate to the `frontend` directory, install dependencies, and start the Vite dev server.

```bash
cd frontend
npm install
npm run dev
```

## Deployment

The project is fully structured for production deployment. The backend serves standard RESTful APIs and Socket.io endpoints, while the frontend builds to static HTML/CSS/JS assets. Ensure you configure CORS and environment variables securely on your production host (e.g., Vercel, Render, Heroku).
