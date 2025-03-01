import express from 'express';
import {getWords, addWord, deleteWord, updateWord} from '../controllers/word.controller.js';

const router = express.Router();


router.post('/', addWord);
router.get('/', getWords);
router.put('/:id', updateWord);
router.delete('/:id', deleteWord);


export default router;