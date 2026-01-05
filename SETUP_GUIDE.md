# Crackzone Setup Instructions

## Google Gemini API Configuration

### Step 1: Get Your API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Step 2: Configure Environment Variables
1. Create a `.env.local` file in the project root directory:
   ```
   c:\VisualStudioOrt\NombreDeTuProyecto\Test tiktok simil\.env.local
   ```

2. Add your API key to the file:
   ```env
   VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
   ```
   Replace `YOUR_API_KEY_HERE` with the API key you copied in Step 1.

### Step 3: Restart Development Server
After adding the API key, restart your development server for the changes to take effect:
```bash
# Stop the current server (Ctrl+C)
# Then restart it:
npm run dev
```

## Verification

Once configured, you should see:
- ✅ No yellow warning banner in the AI Creator tab
- ✅ The "Generate Game" button works and creates real games
- ✅ Console shows `[Gemini] Game generated successfully` when generating games

## Troubleshooting

### API Key Not Working
- Make sure the file is named exactly `.env.local` (with the dot at the start)
- Verify the variable name is exactly `VITE_GEMINI_API_KEY`
- Restart the dev server after making changes
- Check browser console for detailed error messages

### Rate Limits
- Free tier has rate limits (60 requests per minute)
- If you hit limits, wait a minute and try again

## Features Now Functional

✅ **Sidebar Navigation**
- For You / Explore / Following / Friends / LIVE / Create / Profile

✅ **Header Actions**
- Search (logs queries)
- Upload button (routes to /create)
- Login modal
- More menu (Get App, Language, Dark Mode, Feedback)

✅ **Discovery Feed**
- Like, Save, Share, Comment buttons with persistence
- Play game modal

✅ **AI Creator**
- Real AI game generation powered by Google Gemini
- Live preview and code editor
- Publish to profile

✅ **Profile**
- Tab switching (Created / Trending / Achievements)
- Clickable game grid with player
- Settings modal

All interactions are logged to the browser console for debugging!
