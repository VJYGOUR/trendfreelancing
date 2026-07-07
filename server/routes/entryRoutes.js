import express from "express";
import {
  createEntry,
  getEntries,
  deleteEntry,
} from "../controllers/entryController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createEntry);

router.get("/", protect, getEntries);

router.delete("/:id", protect, deleteEntry);

export default router;
