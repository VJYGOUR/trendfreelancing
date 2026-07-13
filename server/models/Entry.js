import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    leads: {
      type: Number,
      default: 0,
    },

    clients: {
      type: Number,
      default: 0,
    },

    revenue: {
      type: Number,
      default: 0,
    },

    coding: {
      type: Number,
      min: 0,
      max: 10,
    },

    post: {
      type: Number,
      min: 0,
      max: 10,
    },

    bookPage: {
      type: Number,
      min: 0,
      max: 1000,
    },
  // NEW FIELDS
    exercise: {
      type: Number,
      min: 0,
      max: 300, // minutes (max 5 hours)
      default: 0,
    },

    meditation: {
      type: Number,
      min: 0,
      max: 120, // minutes (max 2 hours)
      default: 0,
    },
     nevillegoddard: {
      type: Number,
      min: 0,
      max: 120, // minutes (max 2 hours)
      default: 0,
    },
    expression: {
      type: Number,
      min: 0,
      max: 120, // minutes (max 2 hours)
      default: 0,
    },
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Entry", entrySchema);
