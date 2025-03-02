import express from 'express';
import {getWords, addWord, deleteWord, updateWord,searchWordStart} from '../controllers/word.controller.js';

const router = express.Router();


router.post('/', addWord);
router.get('/', getWords);
router.put('/:id', updateWord);
router.delete('/:id', deleteWord);
router.get('/search',searchWordStart);


export default router;