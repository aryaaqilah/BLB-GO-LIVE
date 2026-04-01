import express from "express";
import PostalCode from "../models/PostalCode.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const postalCode = new PostalCode(req.body);
    await postalCode.save();
    res.status(201).json(postalCode);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.get("/", async (req, res) => {
  try {
    const postalCodes = await PostalCode.find().populate('DistrictId');
    res.json(postalCodes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.get("/:id", async (req, res) => {
  try {
    const postalCode = await PostalCode.findById(req.params.id).populate('DistrictId');
    if (!postalCode) return res.status(404).json({ error: "PostalCode not found" });
    res.json(postalCode);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.put("/:id", async (req, res) => {
  try {
    const postalCode = await PostalCode.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('DistrictId');
    if (!postalCode) return res.status(404).json({ error: "PostalCode not found" });
    res.json(postalCode);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.delete("/:id", async (req, res) => {
  try {
    const postalCode = await PostalCode.findByIdAndDelete(req.params.id);
    if (!postalCode) return res.status(404).json({ error: "PostalCode not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;