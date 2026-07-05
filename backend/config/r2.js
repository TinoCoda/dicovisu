import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Cloudflare R2 configuration
// R2 is S3-compatible, so we use the AWS SDK with custom endpoint
const r2Client = new S3Client({
    region: 'auto', // R2 uses 'auto' for region
    endpoint: process.env.R2_ENDPOINT, // Your R2 endpoint (e.g., https://abc123.r2.cloudflarestorage.com)
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'visual-dico-audio';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // Your public R2 URL (if bucket is public)

export default r2Client;
