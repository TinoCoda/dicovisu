import express from 'express';
import {getWords, addWord, deleteWord, updateWord} from '../controllers/word.controller.js';

const router = express.Router();

router.get('/', getWords);
router.post('/', addWord);
router.delete('/:id', deleteWord);
router.put('/:id', updateWord);

export default router;