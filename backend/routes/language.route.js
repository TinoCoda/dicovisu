import express from "express";
import { getLanguages, updateLanguage,addLanguage,deleteLanguage } from "../controllers/language.controller.js";

const router = express.Router();

router.get("/", getLanguages);
router.post("/", addLanguage);
router.put("/:id", updateLanguage);
router.delete("/:id", deleteLanguage);
export default router;