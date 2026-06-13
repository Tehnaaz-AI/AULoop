# AULoop Backend

This directory contains the Node.js Express API and Socket.io server that powers the AULoop marketplace.

## Architecture
- **Express.js API:** Handles standard RESTful requests, including user authentication, product fetching, and administration actions.
- **Socket.io Server:** Powers real-time features such as direct user-to-user chatting and instant notifications.
- **MongoDB:** Database modeling via Mongoose (`/models`).
- **Cloudinary:** Used for storing image and video (Reels) uploads (`/config/cloudinary.js`).

## Environment Variables
Before running the backend, you must create a `.env` file in this directory based on the following keys. **Do not commit your `.env` file to version control.**

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/auloop

# Security
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173

# Media Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Scripts
- `npm run dev`: Starts the server in development mode using Nodemon.
- `npm start`: Starts the server in production mode.
- `npm run seed`: Populates the database with demo users, chats, and listings for testing.
- `npm run seed:clear`: Clears the demo seed data from the database.
