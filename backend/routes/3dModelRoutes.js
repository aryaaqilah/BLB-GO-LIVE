import express from "express";
import ThreeDModel from "../models/3DModel.js";
import Product from "../models/Product.js";
import fs from "fs";
import path from "path";
import multer from "multer";
import { useEffect, useState, useRef, useContext } from "react";
import mongoose from 'mongoose';

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const model = new ThreeDModel(req.body);
    await model.save();
    res.status(201).json(model);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.get("/", async (req, res) => {
  try {
    const models = await ThreeDModel.find();
    res.json(models);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.get("/:id", async (req, res) => {
  try {
    const model = await ThreeDModel.findById(req.params.id);
    if (!model) return res.status(404).json({ error: "3DModel not found" });
    res.json(model);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.put("/:id", async (req, res) => {
  try {
    const model = await ThreeDModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!model) return res.status(404).json({ error: "3DModel not found" });
    res.json(model);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.delete("/:id", async (req, res) => {
  try {
    const model = await ThreeDModel.findByIdAndDelete(req.params.id);
    if (!model) return res.status(404).json({ error: "3DModel not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post("/save", async (req, res) => {
  try {
    const { path, question, answer } = req.body;

    
    
    

    
    if (!path) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newDesign = new ThreeDModel({
      Path : path,
      Question : question,
      Answer : answer,
    });

    await newDesign.save();

    
    const shareLink = `${req.protocol}://${req.get("host")}/api/design3d/${newDesign._id}/ar`;

    res.status(201).json({
      message: "Design saved successfully!",
      designId: newDesign._id,
      shareLink,
    });
  } catch (error) {
    console.error("Error saving design:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join("public", "models", "exported");
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}.gltf`);
  },
});

const upload = multer({ storage });

/**
 * @route   POST /api/design3d/:id/export
 * @desc    Simpan model GLB hasil customizer ke server
 * @access  Public
 */
router.post("/:id/export", upload.single("model"), async (req, res) => {
  try {
    const modelUrl = `/models/exported/${req.params.id}.gltf`;

    await ThreeDModel.findByIdAndUpdate(req.params.id, { modelUrl });
    res.json({ success: true, modelUrl });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan model GLB" });
  }
});

router.put("/:id/add-path", async (req, res) => {
  try {
    
    const { ModelId, Path } = req.body;

    
    

    const updatedModel = await ThreeDModel.findByIdAndUpdate(
      ModelId,
      { 
        Path : Path 
      },
      { new: true } 
    );

    res.status(200).json(updatedModel);
  } catch (error) {
    res.status(500).json({ message: "Gagal update user", error });
  }
});

router.get("/:id/ar", async (req, res) => {
  try {
    const design = await ThreeDModel.findById(req.params.id);
    if (!design) return res.status(404).send("<h2 style='text-align:center; margin-top:50px;'>❌ Desain tidak ditemukan</h2>");

    const ThreeDModelId = req.params.id;
    let filter = { ThreeDModel: ThreeDModelId };
    const product = await Product.findOne(filter);

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    
    
    
    
    
    
    
    
    
    

    
    const arPage = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${product ? product.Name : 'AR View'} - Florist3D</title>
        <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #a55749;
            --bg: #d4c4b5;
          }
          body {
            margin: 0; padding: 0;
            font-family: 'Playfair Display', serif;
            background-color: var(--bg);
            display: flex; flex-direction: column;
            height: 100vh; overflow: hidden;
          }
          .model-header {
            padding: 1.5rem; text-align: center;
            background: white; border-radius: 0 0 2rem 2rem;
            box-shadow: 0 5px 20px rgba(0,0,0,0.05);
            z-index: 10;
          }
          .model-header h1 { margin: 0; font-size: 1.4rem; color: var(--primary); }
          .model-header p { margin: 5px 0 0; font-size: 0.8rem; opacity: 0.7; }
          
          .viewer-container {
            flex: 1; width: 100%; position: relative;
            display: flex; align-items: center; justify-content: center;
          }
          model-viewer {
            width: 100%; height: 100%;
            background: radial-gradient(circle, #ffffff 0%, #d4c4b5 100%);
          }
          .ar-hint {
            position: absolute; bottom: 30px;
            background: rgba(255,255,255,0.8);
            padding: 10px 20px; border-radius: 2rem;
            font-size: 0.9rem; pointer-events: none;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="model-header">
          <h1>${product ? product.Name : 'Buket Anda'}</h1>
          <p>Sentuh untuk memutar • Gunakan dua jari untuk zoom</p>
        </div>

        <div class="viewer-container">
          <model-viewer
            src="/models/exported/${design._id}.gltf"
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            exposure="1"
            interaction-prompt="auto"
          >
          </model-viewer>
          <div class="ar-hint">✨ Ketuk ikon di pojok untuk mode AR</div>
        </div>
      </body>
      </html>
    `;

    res.send(arPage);
  } catch (err) {
    console.error(err);
    res.status(500).send("<h2 style='text-align:center;'>⚠️ Terjadi kesalahan server</h2>");
  }
});

export default router;