import express from "express";
import AdministrationFee from "../models/AdministrationFee.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const adminFee = new AdministrationFee(req.body);
    await adminFee.save();
    res.status(201).json(adminFee);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.get("/", async (req, res) => {
  try {
    const adminFees = await AdministrationFee.find();
    res.json(adminFees);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.get("/:id", async (req, res) => {
  try {
    const adminFee = await AdministrationFee.findById(req.params.id);
    if (!adminFee) return res.status(404).json({ error: "AdministrationFee not found" });
    res.json(adminFee);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.put("/:id", async (req, res) => {
  try {
    const adminFee = await AdministrationFee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!adminFee) return res.status(404).json({ error: "AdministrationFee not found" });
    res.json(adminFee);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.delete("/:id", async (req, res) => {
  try {
    const adminFee = await AdministrationFee.findByIdAndDelete(req.params.id);
    if (!adminFee) return res.status(404).json({ error: "AdministrationFee not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;