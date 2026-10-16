
# FinTrack — Personal Finance & Expense Tracker

FinTrack is a full-stack personal finance management application that helps users track income and expenses, manage budgets, monitor savings goals, visualize financial activity, and receive AI-powered financial insights.

## Features

- **User Authentication:** Secure registration and login using JWT authentication and bcrypt password hashing.
- **Transaction Management:** Add, view, update, and delete income and expense transactions.
- **Budget Management:** Create monthly budgets and track spending against budget limits.
- **Savings Goals:** Create savings goals, monitor progress, and record contributions.
- **Financial Dashboard:** View key financial summaries, including income, expenses, balance, and transaction count.
- **Analytics & Charts:** Visualize financial data using Recharts.
- **AI Financial Assistant:** Get AI-powered financial insights and assistance through the Google Gemini API.
- **Responsive Interface:** Access the application's finance management features through a React-based interface.

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- Recharts
- CSS

### Backend
- Node.js
- Express.js
- REST APIs
- JWT (JSON Web Tokens)
- bcryptjs

### Database
- MongoDB Atlas
- Mongoose

### AI Integration
- Google Gemini API
- `@google/genai`

### Deployment & Version Control
- Vercel — Frontend
- Render — Backend
- Git and GitHub — Version control

## Project Structure

```text
FinTrack/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   └── vercel.json
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js
│   └── package.json
├── .gitignore
└── README.md
```

*Note: The structure above is a high-level overview. Actual files and folder names may vary.*

## Getting Started

### Prerequisites

Make sure you have the following installed or configured:

- Node.js and npm
- A MongoDB Atlas account and database
- A Google Gemini API key for AI features
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/anshumankodz2811-spec/FinTrack.git
cd FinTrack
```

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_random_secret
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder values with your own credentials. Never commit `.env` files or expose API keys and database credentials.

Start the backend:

```bash
npm start
```

The backend will run on the configured port. Locally, the default development URL is typically:

`http://localhost:5000`

### 3. Configure the Frontend

Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

Open the local URL printed by Vite, typically:

`http://localhost:5173`

### 4. Run the Application

Ensure MongoDB Atlas is reachable and both the backend and frontend are running. Register an account or log in to start managing your financial data.

## API Overview

The backend exposes REST API endpoints under `/api`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/profile` | Retrieve the authenticated user's profile |
| GET/POST | `/api/transactions` | Retrieve or create transactions |
| GET/POST | `/api/budgets` | Retrieve or create budgets |
| GET/POST | `/api/savings-goals` | Retrieve or create savings goals |
| POST | `/api/savings-goals/:id/contribute` | Add a savings contribution |
| POST | `/api/ai/chat` | Access the AI assistant |

Additional update and delete operations are available for supported resources. Protected endpoints require a valid JWT in the request's `Authorization` header.

## Deployment

### Frontend — Vercel

The React frontend is deployed on Vercel.

Configure the following environment variable in the Vercel project settings:

```env
VITE_API_URL=https://your-render-service.onrender.com/api
```

Redeploy the frontend after changing environment variables.

### Backend — Render

The Express backend is deployed on Render.

Configure these environment variables in the Render service settings:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`

Ensure MongoDB Atlas network access permits the backend to connect. Keep all credentials private.

## Security Notes

- Passwords are hashed using bcryptjs.
- JWTs are used for authentication and protected API access.
- Secrets belong in environment variables, not source code.
- Frontend variables prefixed with `VITE_` are exposed to the browser and must never contain private credentials.
- Database access should be restricted appropriately.

## Future Enhancements

Potential improvements include:

- Downloadable financial reports
- Recurring transaction support
- Enhanced financial insights and recommendations
- More detailed spending breakdowns
- Additional automated testing

## Author

**Anshuman Tripathi**

GitHub: [@anshumankodz2811-spec](https://github.com/anshumankodz2811-spec)

---

If you find this project useful, consider giving the repository a ⭐ on GitHub.
