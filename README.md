# Personal Expense Tracker

A full-stack MERN personal expense tracker for managing income, expenses, and transaction summaries.

## Features

- User registration and login with JWT authentication
- Dashboard with balance, income, and expense totals
- Recent transaction list
- Expense breakdown by category
- Monthly and weekly expense charts
- Create, edit, filter, and delete transactions
- MongoDB persistence through a REST API

## Project Structure

```text
backend/     Express and MongoDB REST API
frontend/    React and Vite application
```

## Requirements

- Node.js 18 or newer
- MongoDB database, local or MongoDB Atlas
- npm

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/GirishElankonda/personal-expense-tracker.git
cd personal-expense-tracker
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Configure and start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server runs at the URL shown in the terminal, usually `http://localhost:5173`.

By default, the frontend uses `http://localhost:5000/api`. To use another API URL, create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Production Build

```bash
cd frontend
npm run build
npm run preview
```

## API Routes

- `POST /api/auth/register` - Register a user
- `POST /api/auth/login` - Log in a user
- `GET /api/transactions` - List authenticated user transactions
- `POST /api/transactions` - Create a transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction
- `GET /api/transactions/summary` - Get income, expense, and balance totals

Keep `.env` files private. They are excluded from version control by `.gitignore`.
