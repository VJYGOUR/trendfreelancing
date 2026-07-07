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

    mood: {
      type: Number,
      min: 1,
      max: 10,
    },

    stress: {
      type: Number,
      min: 1,
      max: 10,
    },

    confidence: {
      type: Number,
      min: 1,
      max: 10,
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
