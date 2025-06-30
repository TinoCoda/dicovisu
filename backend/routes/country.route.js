import { verifyJWT } from "../middleware/verifyJWT.js";

import { getCountries,addCountry } from "../controllers/country.controller.js";

import express from "express";
const router = express.Router();

// Apply JWT verification middleware to this route
router.use(verifyJWT); // Uncomment this line to enable JWT verification for this route
router.get("/", getCountries);
router.post("/", addCountry);

export default router;
