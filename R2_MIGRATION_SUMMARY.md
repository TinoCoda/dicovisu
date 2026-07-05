# R2 Migration Summary

## What Was Changed

### Backend Changes

1. **New Dependencies**
   - Installed `@aws-sdk/client-s3` for R2 integration

2. **New Files Created**
   - `backend/config/r2.js` - R2 client configuration
   - `backend/scripts/cleanOrphanedAudio.js` - Migration script to clean orphaned metadata
   - `R2_SETUP.md` - Complete setup guide for Cloudflare R2

3. **Modified Files**
   - `backend/middleware/audioUpload.js` - Changed from disk storage to memory storage
   - `backend/controllers/word.controller.js` - Updated upload/delete to use R2 instead of filesystem
   - `backend/models/word.model.js` - Added `key` and `url` fields to audio schema
   - `backend/server.js` - Removed static file serving (no longer needed)

### Frontend Changes

4. **Modified Files**
   - `frontend/src/components/WordContent.jsx` - Updated to use `audio.url` from R2
   - `frontend/src/pages/EditWordPage.jsx` - Updated to use `audio.url` from R2

## What You Need To Do

### 1. Set Up Cloudflare R2 (15-20 minutes)

Follow the complete guide in `R2_SETUP.md`. Quick steps:

1. Create Cloudflare account (if needed): https://dash.cloudflare.com/sign-up
2. Enable R2 (free tier)
3. Create bucket: `visual-dico-audio`
4. Make bucket public
5. Create API tokens
6. Copy credentials

### 2. Add Environment Variables

Add these to your `.env` file (locally) and Render dashboard (production):

```bash
R2_ENDPOINT=https://abc123.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=visual-dico-audio
R2_PUBLIC_URL=https://visual-dico-audio.r2.dev
```

**For Render:**
- Go to your service → Environment tab
- Add each variable
- Save changes (Render will auto-redeploy)

### 3. Clean Up Orphaned Metadata (Local - 1 minute)

After adding environment variables to your local `.env`:

```bash
cd backend
node scripts/cleanOrphanedAudio.js
```

This removes old audio metadata that pointed to deleted files.

### 4. Test Locally (5 minutes)

```bash
# Start backend
npm run dev

# In another terminal, start frontend
npm run dev:ui
```

Try uploading audio to a word and verify:
- Upload succeeds
- Audio plays
- File appears in your R2 bucket

### 5. Deploy to Production

Push changes to GitHub:

```bash
git add .
git commit -m "Migrate audio storage to Cloudflare R2"
git push
```

Render will automatically deploy. After deployment:
- Verify audio uploads work in production
- Check R2 bucket for uploaded files

### 6. Clean Up Orphaned Metadata (Production - Optional)

SSH into Render or use Render Shell:

```bash
cd backend
node scripts/cleanOrphanedAudio.js
```

This removes old metadata from production database.

## How It Works Now

### Before (Ephemeral Filesystem)
1. User uploads audio → Saved to `backend/uploads/audio/`
2. Server restarts → Files deleted
3. Database still has metadata → Broken UI

### After (Cloudflare R2)
1. User uploads audio → Saved to R2 bucket
2. Server restarts → Files persist in R2
3. Frontend loads audio from R2 public URL
4. No more broken audio!

## Cost

With R2 free tier:
- **Storage**: 10 GB FREE
- **Reads**: 10M requests/month FREE
- **Writes**: 1M requests/month FREE
- **Egress**: FREE (no bandwidth charges)

For 1,000 words with 5MB audio each:
- Total: ~5 GB storage
- Cost: **$0/month** (within free tier)

## Backward Compatibility

The code is backward compatible:
- New uploads use R2 (stored in `audio.url` and `audio.key`)
- Old uploads that had `audio.filename` will be cleaned up by migration script
- Frontend checks for `audio.url` first, falls back to old path

## Troubleshooting

See `R2_SETUP.md` for detailed troubleshooting guide.

Common issues:
- **Access Denied**: Check bucket name and API token permissions
- **Audio doesn't play**: Ensure bucket is public
- **Files don't upload**: Verify R2_ENDPOINT is correct

## Questions?

Check `R2_SETUP.md` for:
- Complete setup walkthrough
- CORS configuration
- Custom domain setup (optional)
- Detailed troubleshooting

---

**Summary**: Your audio files will now persist across deployments! 🎉
