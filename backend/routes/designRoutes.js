import express from "express";
import Design3D from "../models/Design3D.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    let{name, flowers, wrapperColor, cardColor, cardText, userId} = req.body;
    if (typeof flowers === "string") {
      flowers = JSON.parse(flowers);
    }
    const design = new Design3D({ name, flowers, wrapperColor, cardColor, cardText, userId });
    await design.save();
    res.status(201).json(design);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  const designs = await Design3D.find().populate("userId");
  res.json(designs);
});

export default router;
