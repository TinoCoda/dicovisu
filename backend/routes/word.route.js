import express from 'express';
import { verifyJWT } from '../middleware/verifyJWT.js';
import {
    getWords, 
    addWord, 
    deleteWord, 
    updateWord,
    searchWordStart,
    addWordRelationship,
    removeWordRelationship,
    getStatistics
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


export default router;