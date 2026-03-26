import express from "express";
import ThreeDModel from "../models/3DModel.js";
import Product from "../models/Product.js";
import fs from "fs";
import path from "path";
import multer from "multer";
import { useEffect, useState, useRef, useContext } from "react";
import mongoose from 'mongoose';

const router = express.Router();

// ➕ Tambah 3DModel (POST /api/3dmodels)
router.post("/", async (req, res) => {
  try {
    const model = new ThreeDModel(req.body);
    await model.save();
    res.status(201).json(model);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 📚 Ambil Semua 3DModel (GET /api/3dmodels)
router.get("/", async (req, res) => {
  try {
    const models = await ThreeDModel.find();
    res.json(models);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 📖 Ambil 3DModel Berdasarkan ID (GET /api/3dmodels/:id)
router.get("/:id", async (req, res) => {
  try {
    const model = await ThreeDModel.findById(req.params.id);
    if (!model) return res.status(404).json({ error: "3DModel not found" });
    res.json(model);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ✏️ Update 3DModel (PUT /api/3dmodels/:id)
router.put("/:id", async (req, res) => {
  try {
    const model = await ThreeDModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!model) return res.status(404).json({ error: "3DModel not found" });
    res.json(model);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 🗑️ Hapus 3DModel (DELETE /api/3dmodels/:id)
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

    console.log("Path ", path);
    console.log("question ", question);
    console.log("answer ", answer);

    // Validasi sederhana
    if (!path) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newDesign = new ThreeDModel({
      Path : path,
      Question : question,
      Answer : answer,
    });

    await newDesign.save();

    // Setelah disimpan, generate link unik dengan ID design
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

// === Konfigurasi folder penyimpanan model GLB ===
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
    console.log("req.body", req.body);
    const { ModelId, Path } = req.body;

    console.log("Model ID:", ModelId);
    console.log("Path :", Path);

    const updatedModel = await ThreeDModel.findByIdAndUpdate(
      ModelId,
      { 
        Path : Path 
      },
      { new: true } // Mengembalikan data user yang sudah terupdate
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

    // 1. TAMPILAN FORM PERTANYAAN (VERIFIKASI)
    // if (!req.query.answer) {
    //   return res.send(`
    //     <!DOCTYPE html>
    //     <html lang="id">
    //     <head>
    //       <meta charset="UTF-8">
    //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //       <title>Verifikasi - ${product ? product.Name : 'Florist3D'}</title>
    //       <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    //       <style>
    //         :root {
    //           --primary: #a55749;
    //           --bg: #d4c4b5;
    //           --dark: #3e4a49;
    //         }
    //         body {
    //           margin: 0; padding: 0;
    //           font-family: 'Playfair Display', serif;
    //           background-color: var(--bg);
    //           display: flex; align-items: center; justify-content: center;
    //           height: 100vh; color: var(--dark);
    //         }
    //         .card {
    //           background: white;
    //           padding: 3rem 2rem;
    //           border-radius: 2.5rem;
    //           box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    //           text-align: center;
    //           width: 90%; max-width: 400px;
    //         }
    //         h2 { color: var(--primary); margin-bottom: 0.5rem; }
    //         .question-box {
    //           background: rgba(165, 87, 73, 0.05);
    //           border-left: 4px solid var(--primary);
    //           padding: 1rem; margin: 1.5rem 0;
    //           text-align: left; border-radius: 0 1rem 1rem 0;
    //         }
    //         input[type=text] {
    //           width: 100%; padding: 1rem;
    //           border: 1px solid #ddd; border-radius: 1rem;
    //           font-family: inherit; font-size: 1rem;
    //           margin-bottom: 1rem; outline: none; box-sizing: border-box;
    //         }
    //         button {
    //           width: 100%; padding: 1rem;
    //           background: var(--primary); color: white;
    //           border: none; border-radius: 5rem;
    //           font-family: inherit; font-size: 1.1rem;
    //           cursor: pointer; transition: 0.3s;
    //         }
    //         button:hover { opacity: 0.9; transform: translateY(-2px); }
    //       </style>
    //     </head>
    //     <body>
    //       <div class="card">
    //         <h2>${product ? product.Name : 'Florist3D'}</h2>
    //         <div class="question-box">
    //           <small style="text-transform:uppercase; letter-spacing:1px; opacity:0.7">Teka-teki</small>
    //           <p style="margin:5px 0 0; font-style:italic;">"${design.Question || "Siapa nama kecil kesayangan kita?"}"</p>
    //         </div>
    //         <form method="GET" action="/api/design3d/${design._id}/ar">
    //           <input type="text" name="answer" placeholder="Jawaban Anda..." autocomplete="off" />
    //           <button type="submit">Buka Kejutan</button>
    //         </form>
    //       </div>
    //     </body>
    //     </html>
    //   `);
    // }

    // 2. LOGIKA CEK JAWABAN
    // if (req.query.answer.trim().toLowerCase() !== design.Answer.trim().toLowerCase()) {
    //   return res.send(`
    //     <div style="font-family: 'Playfair Display', serif; text-align: center; padding-top: 100px; background: #d4c4b5; height: 100vh;">
    //       <h2 style="color: #a55749;">❌ Jawaban Kurang Tepat</h2>
    //       <p>Mungkin ada kenangan yang sedikit terlupa?</p>
    //       <a href="/api/design3d/${design._id}/ar" style="color: #3e4a49; text-decoration: underline;">Coba Ingat Lagi</a>
    //     </div>
    //   `);
    // }

    // 3. TAMPILAN AR MODEL (JIKA BENAR)
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