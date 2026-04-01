import fs from "fs";
import path from "path";
import multer from "multer";
import Design3D from "../models/Design3D.js";
import express from "express";

const router = express.Router();

/**
 * @route   POST /api/design3d
 * @desc    Simpan desain 3D baru
 */
router.post("/", async (req, res) => {
  try {
    let { name, user, flowers, wrapper, card, question, answer } = req.body;

    if (typeof flowers === "string") flowers = JSON.parse(flowers);

    const processedFlowers = (flowers || []).map((f) => ({
      ...f,
      modelPath: `/models/${f.type}.gltf`,
    }));

    const processedWrapper = {
      modelPath: "/models/wrapper.glb",
      parcelColor: wrapper?.parcelColor || "#ffc0cb",
      ribbonColor: wrapper?.ribbonColor || "#ff0000",
      position: wrapper?.position || [0, 0, 0],
      rotation: wrapper?.rotation || [0, 0, 0],
    };

    const processedCard = {
      modelPath: "/models/card.glb",
      color: card?.color || "#ffffff",
      text: card?.text || "",
      position: card?.position || [0, 0.2, 0],
      rotation: card?.rotation || [0, 0, 0],
    };

    const design = new Design3D({
      name,
      user,
      flowers: processedFlowers,
      wrapper: processedWrapper,
      card: processedCard,
      question,
      answer,
    });

    await design.save();
    res.status(201).json({
      message: "✅ Desain berhasil disimpan",
      design,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   GET /api/design3d
 * @desc    Ambil semua desain
 */
router.get("/", async (req, res) => {
  try {
    const designs = await Design3D.find().populate("user", "name email");
    res.json(designs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/design3d/:id
 * @desc    Ambil satu desain berdasarkan ID
 */
router.get("/:id", async (req, res) => {
  try {
    const design = await Design3D.findById(req.params.id).populate("user", "name email");
    if (!design)
      return res.status(404).json({ message: "❌ Desain tidak ditemukan" });

    res.json(design);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/design3d/:id
 * @desc    Update desain
 */
router.put("/:id", async (req, res) => {
  try {
    let { name, flowers, wrapper, card, question, answer } = req.body;

    if (typeof flowers === "string") flowers = JSON.parse(flowers);

    const processedFlowers = (flowers || []).map((f) => ({
      ...f,
      modelPath: `/models/${f.type}.gltf`,
    }));

    const processedWrapper = {
      modelPath: "/models/wrapper.glb",
      parcelColor: wrapper?.parcelColor || "#ffc0cb",
      ribbonColor: wrapper?.ribbonColor || "#ff0000",
      position: wrapper?.position || [0, 0, 0],
      rotation: wrapper?.rotation || [0, 0, 0],
    };

    const processedCard = {
      modelPath: "/models/card.glb",
      color: card?.color || "#ffffff",
      text: card?.text || "",
      position: card?.position || [0, 0.2, 0],
      rotation: card?.rotation || [0, 0, 0],
    };

    const updatedDesign = await Design3D.findByIdAndUpdate(
      req.params.id,
      {
        name,
        flowers: processedFlowers,
        wrapper: processedWrapper,
        card: processedCard,
        question,
        answer,
      },
      { new: true, runValidators: true }
    );

    if (!updatedDesign)
      return res.status(404).json({ message: "❌ Desain tidak ditemukan" });

    res.json({
      message: "✅ Desain berhasil diperbarui",
      updatedDesign,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   DELETE /api/design3d/:id
 * @desc    Hapus desain
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Design3D.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "❌ Desain tidak ditemukan" });

    res.json({ message: "🗑️ Desain berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/design3d/:id/ar
 * @desc    Halaman AR Viewer dengan proteksi pertanyaan
 */
router.get("/:id/ar", async (req, res) => {
  try {
    const design = await Design3D.findById(req.params.id);
    if (!design) return res.status(404).send("<h2>❌ Desain tidak ditemukan</h2>");

    
    if (!req.query.answer) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verifikasi Desain - ${design.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              background: #f0f0f0;
            }
            form {
              background: white;
              padding: 20px 30px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            input[type=text] {
              padding: 8px;
              width: 100%;
              margin-top: 10px;
              margin-bottom: 15px;
            }
            button {
              padding: 8px 15px;
              background: #007BFF;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <h2>${design.name}</h2>
          <p><strong>Pertanyaan:</strong> ${design.question || "Tidak ada pertanyaan"}</p>
          <form method="GET" action="/api/design3d/${design._id}/ar">
            <input type="text" name="answer" placeholder="Jawaban Anda" required />
            <button type="submit">Kirim</button>
          </form>
        </body>
        </html>
      `);
    }

    
    if (req.query.answer.trim().toLowerCase() !== design.answer.trim().toLowerCase()) {
      return res.send(`
        <h2>❌ Jawaban salah</h2>
        <a href="/api/design3d/${design._id}/ar">Coba lagi</a>
      `);
    }

    
const arPage = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${design.name} - AR View</title>
        <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
        <style>
          body {
            margin: 0;
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column; /* Menyusun elemen (Info lalu Model) ke bawah */
            justify-content: center;
            align-items: center;
            background: #f7f7f7;
            gap: 20px; /* Jarak antara teks info dan model */
          }

          /* Info ditaruh di luar model agar rapi */
          .info {
            text-align: center;
            background: transparent;
            font-family: sans-serif;
            color: #333;
          }

          /* Model viewer mengambil 80% layar */
          model-viewer {
            width: 80vw;
            height: 80vh;
            background-color: #ffffff; /* Putih agar kontras dengan background body */
            border-radius: 20px;       /* Sudut melengkung agar cantik */
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); /* Bayangan halus */
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        
        <div class="info">
          <strong>${design.name}</strong><br/>
          <small>AR Mode: Ketuk ikon AR di bawah kanan 👇</small>
        </div>

        <model-viewer
          src="/models/exported/${design._id}.gltf"
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          exposure="1"
        ></model-viewer>
        
      </body>
      </html>
    `;

    res.send(arPage);
  } catch (err) {
    console.error(err);
    res.status(500).send("<h2>⚠️ Terjadi kesalahan server</h2>");
  }
});

router.post("/save", async (req, res) => {
  try {
    const { name, user, flowers, wrapper, card, question, answer } = req.body;

    
    if (!name || !flowers || !wrapper || !card) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newDesign = new Design3D({
      name,
      user,
      flowers,
      wrapper,
      card,
      question,
      answer,
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

    await Design3D.findByIdAndUpdate(req.params.id, { modelUrl });
    res.json({ success: true, modelUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menyimpan model GLB" });
  }
});

export default router;
