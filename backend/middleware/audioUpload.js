import multer from 'multer';

// Use memory storage instead of disk storage
// Files will be stored in memory as Buffer objects
// Then uploaded to Cloudflare R2 in the controller
const storage = multer.memoryStorage();

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
