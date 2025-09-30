# Company Chatbot Frontend (React)

Ocean Professional-themed React frontend for the Company Chatbot. Provides:
- Authentication (login/register)
- Conversation history and management
- Main chat interface with message bubbles
- RAG/semantic "Related" helper
- Environment-based backend configuration

## Quick Start

1) Install dependencies
   npm install

2) Configure environment
   - Copy .env.example to .env and set REACT_APP_BACKEND_URL to your FastAPI backend URL.
   - Optionally set REACT_APP_SITE_URL for auth email redirects.

3) Start the app
   npm start

The app will run at http://localhost:3000

## Environment Variables

- REACT_APP_BACKEND_URL: Backend API base URL (required)
- REACT_APP_SITE_URL: Site URL for auth flows (optional)
- REACT_APP_ENABLE_DEBUG: Feature flag (optional)

See .env.example for defaults.

## Backend Endpoints Expected

Defaults assume the following endpoints; update src/services/api.js if your backend differs:

Auth:
- POST /auth/login { email, password } -> { access_token, user }
- POST /auth/register { email, password, emailRedirectTo }
- GET /auth/me -> user

Conversations:
- GET /conversations -> [ { id, title } ]
- POST /conversations { title } -> { id, title }
- GET /conversations/:id -> { id, title, messages: [ { id, role, content } ] }
- POST /conversations/:id/messages { content } -> { assistant|messages }

RAG:
- GET /rag/search?q=... -> { results: [...] } or array

If your backend follows the provided OpenAPI under /company_chatbot_backend, adjust to:
- POST /auth/token (form) and POST /auth/signup for signup
- GET/POST under /chat/... for chat and messages
- POST /rag/search with { query } body
By default this frontend uses simpler paths as listed above for clarity.

## Theming

The Ocean Professional theme is applied via CSS variables in src/theme.css:
- primary #2563EB, secondary #F59E0B, error #EF4444
- background #f9fafb, surface #ffffff, text #111827
- Subtle gradients, rounded corners, and shadows

## Notes

- The app stores the current user in localStorage and bearer token in-memory.
- Ensure CORS is enabled on the backend for the frontend origin.
- For deployments behind a different origin than the backend, set REACT_APP_BACKEND_URL accordingly.
