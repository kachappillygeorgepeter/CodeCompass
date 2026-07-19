# Code Compass

Code Compass is a lightweight browser extension that helps you understand highlighted code snippets instantly.

## Project Structure

```
code-compass/
├── backend/          ← Vercel serverless function (deploy this to Vercel)
│   ├── index.js
│   ├── package.json
│   └── vercel.json
└── frontend/         ← Chrome extension (load unpacked in Chrome)
    ├── manifest.json
    ├── icons/
    └── src/
        ├── background/
        ├── content/
        ├── options/
        └── shared/
```

## Deployment Steps

### 1. Deploy the Backend to Vercel
1. Push this repo to GitHub
2. Go to vercel.com → Add Project → import your repo
3. Set **Root Directory** to `backend`
4. Add these environment variables in the Vercel dashboard:
   - `AI_API` — your Google AI API endpoint URL (e.g. `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`)
   - `AI_API_KEY` — your Google AI API key
5. Deploy and copy your Vercel URL (e.g. `https://code-compass-backend.vercel.app/`)

### 2. Update the Frontend
Open `frontend/src/shared/api-client.js` and replace the `BACKEND_URL` with your actual Vercel URL.

### 3. Load the Extension in Chrome
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `frontend/` folder
