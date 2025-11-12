import express from "express";
import { getProperties, getProperty } from "../controllers/propertyController.js";

const propertyRouter = express.Router();

// Get all properties (supports page, city, guests filters)
propertyRouter.get("/", getProperties);

// Get single property by ID
propertyRouter.get("/:id", getProperty);

export { propertyRouter };
