import { verifyJWT } from "../middleware/verifyJWT.js";

import { getCountries,addCountry } from "../controllers/country.controller.js";

import express from "express";
const router = express.Router();

// Require a logged-in session for all country management.
router.use(verifyJWT);
router.get("/", getCountries);
router.post("/", addCountry);

export default router;
