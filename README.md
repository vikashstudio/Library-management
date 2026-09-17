# 📚 Library Management System

A full-stack production-ready **Library Management System** built with **HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, MongoDB/Mongoose**, and **Express Session Authentication**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-v18+-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-v6.0+-brightgreen.svg)

---

## 🌟 Key Features

1. **Authentication & Authorization**:
   - Session-based auth using `express-session` and `connect-mongo`.
   - `bcryptjs` password hashing with salt rounds.
   - Role-based permissions (`admin` and `user`).
   - Non-admin write protection middleware (`isAdmin`).

2. **Book Catalog Management (CRUD + Search)**:
   - Full CRUD operations with auto-inventory calculation.
   - Real-time stock availability tracking (`availableQuantity` vs `quantity`).
   - Case-insensitive search by Title, Author, ISBN, or Category.

3. **Member Directory (CRUD + Search)**:
   - Unique `membershipId` and `email` constraint validations.
   - Active/Inactive member status filters.
   - Search by Name, Email, Phone, or Membership ID.

4. **Book Circulation (Issue & Return)**:
   - Automatic availability deduction upon issuing a book.
   - Duplicate active issue restriction for same member and book.
   - Automatic availability recovery upon book return.

5. **Analytics Dashboard**:
   - Real-time counter metrics for Total Books, Available Books, Issued Books, and Registered Members.

---

## 📂 Project Structure

```text
library-management/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, logout, profile
│   │   ├── bookController.js     # Book CRUD & Search
│   │   ├── memberController.js   # Member CRUD & Search
│   │   ├── issueController.js    # Circulation Issue & Return
│   │   └── dashboardController.js# Summary statistics API
│   ├── middleware/
│   │   ├── auth.js               # Session auth & admin authorization
│   │   └── error.js              # Centralized error handler
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt hooks
│   │   ├── Book.js               # Book schema with quantity validation
│   │   ├── Member.js             # Member schema with unique IDs
│   │   └── Issue.js              # Circulation transaction schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── issueRoutes.js
│   │   └── dashboardRoutes.js
│   └── app.js                    # Express app middleware & route configuration
├── public/                       # Frontend static files
│   ├── css/
│   │   └── style.css             # Responsive dark-slate CSS theme
│   ├── js/
│   │   ├── api.js                # Centralized fetch helper & session manager
│   │   ├── auth.js               # Login & Register handlers
│   │   ├── books.js              # Book catalog UI & modals
│   │   ├── dashboard.js          # Dashboard counters loader
│   │   ├── members.js            # Member directory UI & modals
│   │   └── issue-return.js       # Book issue/return UI & modals
│   ├── index.html                # Session checker & redirect
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── books.html
│   ├── members.html
│   └── issue-return.html
├── .env.example
├── .gitignore
├── package.json
└── server.js                     # HTTP server entrypoint
```

---

## 🛠️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/library_db
SESSION_SECRET=supersecretlibrarykey123
NODE_ENV=development
```

---

## 🚀 Quick Setup Instructions

1. **Clone Repository & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start MongoDB**:
   Ensure MongoDB service is running locally on port `27017` or use MongoDB Atlas connection string in `.env`.

3. **Run Application**:
   ```bash
   # Development Mode (auto-reload)
   npm run dev

   # Production Mode
   npm start
   ```

4. **Access Web Portal**:
   Open browser at `http://localhost:5000/`.

---

## 📡 REST API Reference Overview

| HTTP Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account (`user`/`admin`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & start session |
| `POST` | `/api/auth/logout` | Private | Terminate session & clear cookies |
| `GET` | `/api/auth/me` | Private | Get current session user profile |
| `GET` | `/api/dashboard/stats` | Private | Get library dashboard counter metrics |
| `GET` | `/api/books` | Private | List all catalog books |
| `GET` | `/api/books/search?query=` | Private | Search books by title/author/isbn/category |
| `POST` | `/api/books` | Admin | Create a new book |
| `PUT` | `/api/books/:id` | Admin | Update book details |
| `DELETE` | `/api/books/:id` | Admin | Delete book |
| `GET` | `/api/members` | Private | List all members |
| `GET` | `/api/members/search?query=` | Private | Search members |
| `POST` | `/api/members` | Admin | Register new member |
| `PUT` | `/api/members/:id` | Admin | Update member details |
| `DELETE` | `/api/members/:id` | Admin | Delete member |
| `GET` | `/api/issues` | Private | List book circulation transactions |
| `POST` | `/api/issues` | Admin | Issue a book to a member |
| `PUT` | `/api/issues/:id/return` | Admin | Process book return |

---

## ☁️ Deployment Guide

### Deploying Backend (Render / Railway / Heroku):
1. Push project repository to GitHub.
2. Connect repository to Render / Railway.
3. Configure Environment Variables in deployment platform settings (`MONGODB_URI`, `SESSION_SECRET`, `NODE_ENV=production`).
4. Set Build Command: `npm install`
5. Set Start Command: `npm start`

---

## 📜 License
This project is licensed under the MIT License.
