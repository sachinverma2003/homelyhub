import express from "express";
import { getProperties, getProperty } from "../controllers/propertyController.js";

const propertyRouter = express.Router();

// ✅ FIX: Changed "/get-all" to "/" 
// This makes the URL: /api/v1/rent/listing
propertyRouter.get("/", getProperties);

// This handles: /api/v1/rent/listing/123
propertyRouter.get("/:id", getProperty);

export { propertyRouter };