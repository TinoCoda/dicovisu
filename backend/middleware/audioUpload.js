import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'audio');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Use wordId from params or generate unique filename
        const wordId = req.params.id || Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${wordId}${ext}`);
    }
});

// File filter - only accept audio files
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'audio/mpeg',      // .mp3
        'audio/wav',       // .wav
        'audio/webm',      // .webm
        'audio/ogg',       // .ogg
        'audio/mp4',       // .m4a
        'audio/x-m4a'      // .m4a alternative
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Only audio files are allowed. Received: ${file.mimetype}`), false);
    }
};

// Configure multer with size limit (5MB) and file filter
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    },
    fileFilter: fileFilter
});

export default upload;
