import express from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import upload from '../middleware/audioUpload.js';
import {
    getWords,
    addWord,
    deleteWord,
    updateWord,
    searchWordStart,
    addWordRelationship,
    removeWordRelationship,
    getStatistics,
    uploadAudio,
    deleteAudio
} from '../controllers/word.controller.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getWords);
router.get('/search', searchWordStart);
router.get('/statistics', getStatistics);

// Protected routes (authentication required)
router.post('/', verifyJWT, addWord);
router.put('/:id', verifyJWT, updateWord);
router.delete('/:id', verifyJWT, deleteWord);

// Word relationship routes (authentication required)
router.post('/:wordId/relationships', verifyJWT, addWordRelationship);
router.delete('/:wordId/relationships/:relatedWordId', verifyJWT, removeWordRelationship);

// Audio pronunciation routes (authentication required)
router.post('/:id/audio', verifyJWT, upload.single('audio'), uploadAudio);
router.delete('/:id/audio', verifyJWT, deleteAudio);

export default router;