import express from "express";
import District from "../models/District.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const district = new District(req.body);
    await district.save();
    res.status(201).json(district);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.get("/", async (req, res) => {
  try {
    const districts = await District.find().populate('city_id');
    res.json(districts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.get("/get-by-id/", async (req, res) => {
  try {
        const { kecamatan_id } = req.query;
        
        let filter = {};
        if (kecamatan_id) {
            
            filter = { kecamatan_id: Number(kecamatan_id) };
        }

        
        const data = await District.find(filter); 
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get("/:id", async (req, res) => {
  try {
    const district = await District.findById(req.params.id).populate('city_id');
    if (!district) return res.status(404).json({ error: "District not found" });
    res.json(district);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.put("/:id", async (req, res) => {
  try {
    const district = await District.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('CityId');
    if (!district) return res.status(404).json({ error: "District not found" });
    res.json(district);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.delete("/:id", async (req, res) => {
  try {
    const district = await District.findByIdAndDelete(req.params.id);
    if (!district) return res.status(404).json({ error: "District not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;