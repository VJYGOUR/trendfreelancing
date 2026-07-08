import Entry from "../models/Entry.js";

export const createEntry = async (req, res) => {
  try {
    const {
      date,
      leads,
      clients,
      revenue,
      coding,
      post,
      bookPage,
      exercise,
      meditation,
      note,
    } = req.body;
    console.log(leads);
    const userId = req.userId;
    console.log("-----", userId);
    const entry = await Entry.create({
      userId,
      date,
      leads,
      clients,
      revenue,
      coding,
      post,
      bookPage,
      exercise: exercise || 0,
      meditation: meditation || 0,
      note,
    });
    console.log(entry);
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
    console.log(entries);
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
// Update Entry
export const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      leads,
      clients,
      revenue,
      coding,
      post,
      bookPage,
      exercise,
      meditation,
      note,
    } = req.body;

    const entry = await Entry.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Entry not found",
      });
    }

    // Update fields
    if (leads !== undefined) entry.leads = leads;
    if (clients !== undefined) entry.clients = clients;
    if (revenue !== undefined) entry.revenue = revenue;
    if (coding !== undefined) entry.coding = coding;
    if (post !== undefined) entry.post = post;
    if (bookPage !== undefined) entry.bookPage = bookPage;
    if (exercise !== undefined) entry.exercise = exercise;
    if (meditation !== undefined) entry.meditation = meditation;
    if (note !== undefined) entry.note = note;

    await entry.save();

    res.json(entry);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
