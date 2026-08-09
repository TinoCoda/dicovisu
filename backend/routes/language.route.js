import express from "express";
import { getLanguages, updateLanguage,addLanguage,deleteLanguage } from "../controllers/language.controller.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = express.Router();

// Require a logged-in session for all language management, matching country.route.js.
router.use(verifyJWT);
router.get("/", getLanguages);
router.post("/", addLanguage);
router.put("/:id", updateLanguage);
router.delete("/:id", deleteLanguage);
export default router;