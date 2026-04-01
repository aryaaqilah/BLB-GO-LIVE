import express from "express";
import Component from "../models/Component.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const component = new Component(req.body);
    await component.save();
    res.status(201).json(component);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.get("/", async (req, res) => {
  try {
    const components = await Component.find({
      _id: { $ne: "694e44d385890620cea2e870" }
    });
    res.json(components);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.get("/:id", async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) return res.status(404).json({ error: "Component not found" });
    res.json(component);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.put("/:id", async (req, res) => {
  try {
    const component = await Component.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!component) return res.status(404).json({ error: "Component not found" });
    res.json(component);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.delete("/:id", async (req, res) => {
  try {
    const component = await Component.findByIdAndDelete(req.params.id);
    if (!component) return res.status(404).json({ error: "Component not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;