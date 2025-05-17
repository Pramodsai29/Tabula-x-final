# TabulaX - LLM-Powered Table Transformation Platform

TabulaX is a powerful platform that leverages Large Language Models (LLMs) to perform multi-class table transformations. This project is built using the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- **Intuitive Upload Interface**: Upload source and target tables in CSV or Excel format
- **Smart Transformation Analysis**: Automatically classifies transformations (String-based, Numerical, Algorithmic, General)
- **LLM-Powered Insights**: Uses Gemini 2.5 to understand and generate transformation functions
- **Data Join Tools**: Apply transformations and join data using fuzzy matching or exact match
- **Comprehensive Results**: View metrics like F1-score, Precision, Recall, and Edit Distance analysis

## Project Structure

```
tabulax-mern/
├── backend/          # Node.js and Express backend
├── frontend/         # React frontend 
├── .env              # Environment variables
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Google API Key (for Gemini 2.5 integration)

### Installation

1. Clone the repository
2. Set up environment variables in `.env`
3. Install backend dependencies: `cd backend && npm install`
4. Install frontend dependencies: `cd frontend && npm install`
5. Start the backend: `cd backend && npm start`
6. Start the frontend: `cd frontend && npm start`

## Technology Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **LLM Integration**: Google Gemini 2.5 API

## License

MIT
