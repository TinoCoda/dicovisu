# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Visual-Dico is a multilingual dictionary application built with the MERN stack, specialized for Kikongo Language Cluster and other African languages. It features advanced linguistic capabilities including lemmatization, word relationships, and AI-enhanced search functionality.

## Development Commands

### Backend Development
```bash
npm run dev          # Start backend with nodemon (watches for changes)
npm start            # Start backend in production mode
```

### Frontend Development
```bash
npm run dev:ui       # Start Vite dev server for frontend
cd frontend && npm run dev   # Alternative: run from frontend directory
```

### Production Build
```bash
npm run build        # Install dependencies and build frontend for production
```

### Frontend-specific Commands
```bash
cd frontend
npm run lint         # Run ESLint on frontend code
npm run preview      # Preview production build
```

## Architecture Overview

### Backend Structure (Express + MongoDB)

**Entry Point:** `backend/server.js`
- ES module-based Node.js application
- Uses environment variables from `.env` file (not committed)
- Serves static frontend files in production mode

**Key Routes:**
- `/api/words` - Word CRUD operations and search
- `/api/languages` - Language management
- `/api/users` - User management
- `/api/auth` - Authentication (login/logout/refresh)
- `/api/countries` - Country data

**Authentication:**
- JWT-based authentication with refresh tokens
- Access tokens sent via `Authorization: Bearer <token>` header
- Refresh tokens handled via HTTP-only cookies
- Middleware: `backend/middleware/verifyJWT.js` protects routes
- Rate limiting on login endpoint: `backend/middleware/loginLimiter.js`

**Models:**
- `Word` model includes `relatedWords` array with typed relationships (singular, plural, synonym, antonym, variant, derived, see_also, infinitive)
- Words have `translations` array for cross-language linking
- Words support `language` as an array (multilingual entries)

**Special Features:**
- **Kikongo Language Cluster Lemmatizer** (`backend/utils/lemmatizer.js`): Advanced morphological analyzer that handles:
  - Agglutinative verb structures (subject + object + verb stem)
  - Resultative/perfect tense (subject + 'me' + verb)
  - h/v phonological alternation
  - Nominal class prefix stripping
  - Used in statistics computation to avoid counting inflected forms as missing words
- Sentence deduplication in examples (automatically cleans duplicate sentences)

### Frontend Structure (React + Vite + Chakra UI)

**Entry Point:** `frontend/src/main.jsx`
**Router:** React Router v7 in `frontend/src/App.jsx`

**State Management:**
- **Zustand stores** for global state:
  - `authStore.js` - Authentication state (isAuthenticated, user, token, roles)
  - `words.js` - Word data and operations
  - `languages.js` - Language data
  - `countries.js` - Country data
  - `global.js` - Shared global state (base store)

**API Layer:**
- Located in `frontend/src/api/` (e.g., `words/wordApi.js`)
- Newer auth API in `frontend/src/features/auth/authApi.js`
- Axios interceptor (`frontend/src/features/auth/interceptor.js`) automatically:
  - Attaches JWT tokens to requests
  - Handles 401/403 by refreshing tokens
  - Retries failed requests after token refresh

**Configuration:**
- `frontend/src/api/config/serverUrl.js` defines `SERVER_API_URL` (empty string in production, uses relative URLs)
- Vite dev server proxies `/api` to `http://localhost:5000` (see `frontend/vite.config.js`)

**Key Pages:**
- `HomePage.jsx` - Search and browse words
- `AddNewEntry.jsx` - Add new dictionary entries
- `EditWordPage.jsx` - Edit existing words
- `DetailPage.jsx` - View word details and relationships
- `StatisticsPage.jsx` - Dictionary statistics
- `AddWordsByJson.jsx` - Bulk import functionality

## Key Patterns

### Authentication Flow
1. User logs in via `authStore.login()` → calls `useLoginEndpoint()`
2. Backend returns access token (JWT) + refresh token (HTTP-only cookie)
3. Frontend stores access token in Zustand `authStore` and `baseStore`
4. Axios interceptor attaches `Bearer <token>` to all API requests
5. On 401/403, interceptor calls `useRefreshEndpoint()` to get new access token
6. Original request retried with new token

### Word Search with Lemmatization
- Word controller imports `isWordInDictionary` from `lemmatizer.js`
- Search considers inflected forms by generating candidate stems
- Supports agglutinative morphology typical of Kikongo verbs and nouns

### Adding Word Relationships
- Use `AddRelationshipModal.jsx` component
- Relationships stored bidirectionally (both words link to each other)
- API endpoints: `useAddRelationshipEndpoint`, `useRemoveRelationshipEndpoint`

## Important Notes

- **Do not commit `.env` file** - contains secrets (MongoDB URI, JWT secrets)
- **Production mode**: Set `NODE_ENV=production` to serve frontend build
- **CORS**: Backend configured via `backend/config/corsOptions.js` and `backend/config/allowedOrigins.js`
- **Logging**: Custom logger middleware in `backend/middleware/logger.js` writes to files in `backend/logs/`
- **Error handling**: Centralized error handler in `backend/middleware/errorHandler.js`

## Environment Variables Required

Backend `.env` file needs:
- `MONGO_URI` - MongoDB connection string
- `ACCESS_TOKEN_SECRET` - JWT access token secret
- `REFRESH_TOKEN_SECRET` - JWT refresh token secret
- `PORT` - Server port (defaults to 5000)
- `NODE_ENV` - Set to 'production' for production builds

## Testing

No test suite is currently configured. Tests would need to be added for both frontend and backend.

## Audio Pronunciation System

**Architecture:** Filesystem-based storage (zero cost)
- Audio files stored in `backend/uploads/audio/` directory
- Metadata (filename, size, mimetype, uploadedAt) stored in Word model
- Files served statically via Express at `/uploads/audio/` with 30-day browser cache
- Multer middleware handles uploads with 5MB limit and audio-only validation

**Frontend Features:**
- `AudioRecorder.jsx` component with live waveform visualization during recording
- Mobile-optimized UI with touch-friendly buttons (50-60px height)
- Recording timer with pulsing badge
- Upload from file or record directly from microphone
- `WaveformVisualizer.jsx` provides real-time audio visualization using Web Audio API

**API Endpoints:**
- `POST /api/words/:id/audio` - Upload audio file (requires JWT auth)
- `DELETE /api/words/:id/audio` - Delete audio file

**Scalability Notes:**
- Current solution handles 100-10,000 users with filesystem storage
- Files persist on server disk (ephemeral on platforms like Render/Heroku)
- For production at scale, migrate to Cloudflare R2 or AWS S3
- No additional environment variables required

## Future Improvements & Roadmap

### Morphological Submodule System for Agglutinated Languages

**Problem:** Kikongo and other Bantu languages are highly agglutinative, meaning words are formed by combining multiple morphemes (roots, prefixes, suffixes). Currently, each inflected form is stored as a separate word entry, leading to:
- Data redundancy (same root stored hundreds of times)
- Difficult maintenance (updating a root requires changing all inflected forms)
- Inefficient search (must generate all possible forms)
- Loss of linguistic structure information

**Proposed Solution:** Store words as **composable submodules** with morphological decomposition:

```javascript
// Example: "tunamwonile" (we saw him/her)
// Current: stored as single word entry
// Proposed: stored as composition of submodules

{
  root: "mon" (to see),
  submodules: [
    { type: "subject_prefix", value: "tu", meaning: "we (1st person plural)" },
    { type: "tense", value: "na", meaning: "recent past tense" },
    { type: "object_prefix", value: "mw", meaning: "him/her (class 1)" },
    { type: "root", value: "on", meaning: "see" },
    { type: "perfective", value: "ile", meaning: "completed action" }
  ],
  word: "tunamwonile",
  meaning: "we saw him/her",
  language: "kikongo"
}
```

**Benefits:**
- **Reduced storage:** Store root once, generate inflections on-the-fly
- **Better search:** Search by any morpheme (all verbs with "tu-" prefix)
- **Educational value:** Users learn word structure, not just translations
- **Linguistic accuracy:** Preserves grammatical information
- **Easier maintenance:** Update root meaning once, all forms inherit changes

**Implementation Considerations:**
- Extend Word model with `submodules` array field
- Create morpheme database (subject prefixes, object markers, tense markers, etc.)
- Update lemmatizer to decompose words into submodules during import
- Add UI to visualize morphological structure on word detail page
- Create submodule search/filter functionality
- Consider storing both flat word + decomposed structure for backward compatibility

**Priority:** Medium (after core features are stable)
**Complexity:** High (requires linguistic expertise + complex data modeling)

**Related Files:**
- `backend/utils/lemmatizer.js` - Already handles basic morphological analysis
- `backend/models/word.model.js` - Would need schema extension
- `frontend/src/pages/DetailPage.jsx` - Could show morpheme breakdown visually
