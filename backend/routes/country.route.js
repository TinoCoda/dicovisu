import { verifyJWT } from "../middleware/verifyJWT.js";

import { getCountries } from "../controllers/country.controller.js";

import express from "express";
const router = express.Router();

// Apply JWT verification middleware to this route
router.use(verifyJWT); // Uncomment this line to enable JWT verification for this route
router.get("/", getCountries);

export default router;
