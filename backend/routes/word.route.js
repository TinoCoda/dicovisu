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
router.use(verifyJWT); // Apply JWT verification middleware to all routes in this router


router.post('/', addWord);
router.get('/', getWords);
router.put('/:id', updateWord);
router.delete('/:id', deleteWord);
router.get('/search',searchWordStart);
router.get('/statistics', getStatistics);

// Word relationship routes
router.post('/:wordId/relationships', addWordRelationship);
router.delete('/:wordId/relationships/:relatedWordId', removeWordRelationship);

// Audio pronunciation routes
router.post('/:id/audio', upload.single('audio'), uploadAudio);
router.delete('/:id/audio', deleteAudio);

export default router;