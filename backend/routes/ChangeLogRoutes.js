import express from "express";
import ChangeLog from "../models/ChangeLog.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const logs = await ChangeLog.find()
      .populate("AdminId", "username")
      .sort({ CreatedAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const log = new ChangeLog(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;