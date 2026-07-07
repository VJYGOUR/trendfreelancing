import Entry from "../models/Entry.js";

export const createEntry = async (req, res) => {
  try {
    const { date, leads, clients, revenue, mood, stress, confidence, note } =
      req.body;
    console.log(leads);
    const userId = req.userId;
    console.log("-----", userId);
    const entry = await Entry.create({
      userId,
      date,
      leads,
      clients,
      revenue,
      mood,
      stress,
      confidence,
      note,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error.message);
  }
};
export const getEntries = async (req, res) => {
  try {
    const entries = await Entry.find({
      userId: req.userId,
    }).sort({ date: -1 });

    res.json(entries);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    await entry.deleteOne();

    res.json({
      message: "Entry deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
