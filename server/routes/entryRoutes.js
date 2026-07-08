import express from "express";
import {
  createEntry,
  getEntries,
  deleteEntry,
  updateEntry,
} from "../controllers/entryController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createEntry);

router.get("/", protect, getEntries);
router.put("/entries-edit/:id", protect, updateEntry);
router.delete("/entries-delete/:id", protect, deleteEntry);

export default router;
