import express from "express";
import City from "../models/City.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const city = new City(req.body);
    await city.save();
    res.status(201).json(city);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.get("/", async (req, res) => {
  try {
    const cities = await City.find().populate('provinsi_id');
    res.json(cities);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.get("/get-by-id/", async (req, res) => {
  try {
        const { kabupaten_id } = req.query;
        
        let filter = {};
        if (kabupaten_id) {
            
            filter = { kabupaten_id: Number(kabupaten_id) };
        }

        
        const data = await City.find(filter); 
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get("/:id", async (req, res) => {
  try {
    const city = await City.findById(req.params.id).populate('provinsi_id');
    if (!city) return res.status(404).json({ error: "City not found" });
    res.json(city);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.put("/:id", async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('ProvinceId');
    if (!city) return res.status(404).json({ error: "City not found" });
    res.json(city);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.delete("/:id", async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) return res.status(404).json({ error: "City not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;