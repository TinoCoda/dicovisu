# Cloudflare R2 Setup Guide

This guide will help you set up Cloudflare R2 for audio file storage in Visual-Dico. R2 is free for up to 10GB storage and 10 million reads per month.

## Why R2?

- **Persistent storage**: Files survive server restarts/deployments (unlike Render's ephemeral filesystem)
- **Free tier**: 10GB storage + 10 million reads/month
- **No egress fees**: Unlike AWS S3, R2 doesn't charge for bandwidth
- **S3-compatible**: Uses standard S3 API

## Step 1: Create Cloudflare Account & R2 Bucket

1. **Sign up for Cloudflare** at https://dash.cloudflare.com/sign-up (if you don't have an account)

2. **Enable R2**:
   - Go to https://dash.cloudflare.com/
   - Click "R2" in the left sidebar
   - Click "Purchase R2" (it's free, you won't be charged unless you exceed limits)

3. **Create a bucket**:
   - Click "Create bucket"
   - Name: `visual-dico-audio` (or any name you prefer)
   - Location: Choose closest to your users (e.g., "Automatic" for global)
   - Click "Create bucket"

## Step 2: Make Bucket Public

1. **Enable public access**:
   - Click on your bucket name
   - Go to "Settings" tab
   - Under "Public access", click "Allow Access"
   - Click "Allow" to confirm

2. **Note your public URL**:
   - After enabling public access, you'll see a URL like:
   - `https://pub-abc123xyz.r2.dev` or `https://visual-dico-audio.r2.dev`
   - **Save this URL** - you'll need it for environment variables

## Step 3: Create API Tokens

1. **Create R2 API token**:
   - In R2 dashboard, click "Manage R2 API Tokens" (right sidebar)
   - Click "Create API token"
   - **Permissions**: Choose "Object Read & Write"
   - **Bucket**: Select your bucket (`visual-dico-audio`)
   - **TTL**: Leave as "Forever" (or set expiration if needed)
   - Click "Create API Token"

2. **Copy credentials**:
   - You'll see three values:
     - **Access Key ID** (looks like: `abc123...`)
     - **Secret Access Key** (looks like: `xyz789...`)
     - **Endpoint URL** (looks like: `https://abc123.r2.cloudflarestorage.com`)
   - **IMPORTANT**: Copy these immediately - the secret key won't be shown again!

## Step 4: Update Environment Variables

Add these variables to your `.env` file (locally) and Render environment variables (production):

```bash
# Cloudflare R2 Configuration
R2_ENDPOINT=https://abc123.r2.cloudflarestorage.com    # From Step 3
R2_ACCESS_KEY_ID=your_access_key_id                    # From Step 3
R2_SECRET_ACCESS_KEY=your_secret_access_key            # From Step 3
R2_BUCKET_NAME=visual-dico-audio                       # From Step 1
R2_PUBLIC_URL=https://visual-dico-audio.r2.dev         # From Step 2
```

### For Render Deployment:

1. Go to your Render dashboard
2. Click on your service
3. Go to "Environment" tab
4. Add each variable above as a new environment variable
5. Click "Save Changes"
6. Render will automatically redeploy

## Step 5: Clean Up Orphaned Audio Metadata

Run the migration script to remove old audio metadata that pointed to deleted files:

```bash
cd backend
node scripts/cleanOrphanedAudio.js
```

This will:
- Find all words with audio metadata
- Remove metadata for files that were on the old ephemeral filesystem
- Keep metadata for valid R2 files (if any)

## Step 6: Test Audio Upload

1. Start your server:
   ```bash
   npm run dev
   ```

2. Go to a word detail page in your app

3. Try uploading an audio file

4. Verify:
   - File uploads successfully
   - Audio player appears
   - Audio plays correctly
   - Check your R2 bucket - you should see the file under `audio/` prefix

## Troubleshooting

### Error: "Access Denied" when uploading

**Cause**: API token doesn't have write permissions or bucket name is wrong

**Fix**:
- Check `R2_BUCKET_NAME` matches your actual bucket name
- Ensure API token has "Object Read & Write" permissions
- Regenerate API token if needed

### Error: "InvalidAccessKeyId"

**Cause**: Wrong access key ID or secret access key

**Fix**:
- Double-check `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`
- Ensure there are no extra spaces or quotes
- Regenerate API token if you lost the secret key

### Audio doesn't play

**Cause**: Bucket is not public or CORS is not configured

**Fix**:
1. Make sure bucket is public (Step 2)
2. Add CORS rules to your bucket:
   - Go to R2 bucket settings
   - Under "CORS policy", add:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

### Files not appearing in R2 bucket

**Cause**: Wrong endpoint URL

**Fix**:
- Verify `R2_ENDPOINT` is correct (should end with `.r2.cloudflarestorage.com`)
- Check server logs for upload errors

## Cost Estimate

With R2 free tier:
- **Storage**: 10 GB/month FREE
- **Reads**: 10 million requests/month FREE
- **Writes**: 1 million requests/month FREE
- **No egress fees** ever

For a dictionary with:
- 10,000 words
- 5 MB average audio file
- Total: ~50 GB storage
- Cost: ~$0.75/month ($0.015 per GB over 10 GB)

Much cheaper than AWS S3, and you won't lose files on server restarts!

## Next Steps

After migration is complete:
1. Monitor your R2 usage in Cloudflare dashboard
2. Consider adding a custom domain for R2 public URL (optional)
3. Set up automatic backups for R2 bucket (optional)

## Custom Domain (Optional)

Instead of `https://visual-dico-audio.r2.dev`, you can use your own domain:

1. Go to R2 bucket settings
2. Click "Connect domain"
3. Enter your subdomain (e.g., `cdn.visual-dico.com`)
4. Follow Cloudflare's DNS setup instructions
5. Update `R2_PUBLIC_URL` in your environment variables

This gives you branded URLs like: `https://cdn.visual-dico.com/audio/12345.mp3`
