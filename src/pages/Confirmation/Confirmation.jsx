import "./Confirmation.css";
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { get as getDb } from "idb-keyval";
import { del as delDb } from "idb-keyval";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";

function MainSection({ selectedProduct, modelScene, meta }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [data, setData] = useState();
  let tempData = {};
  const handleGoBack = () => window.history.back();

  const [pesan, setPesan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [voucher, setVoucher] = useState("");

  const handleCardSelect = (selectedProduct) => {
    const summaryText =
      meta?.summary
        .filter((item) => item.qty > 0)
        .map((item) => `${item.name} x${item.qty}`)
        .join(", ") || "";

    let finalDataToSend;

    if (selectedProduct) {
      finalDataToSend = selectedProduct;
    } else {
      finalDataToSend = {
        id: "",
        isCustomizable: true,
        title: meta.modelName,
        description: summaryText,
        price: meta?.totalPrice,
        image: "",
        // modelScene: modelScene, // ❌ HAPUS BARIS INI (Penyebab Error)
        quantity: 1,
        catatan: catatan,
        voucher: voucher,
        question: meta.question,
        answer: meta.answer,
        pesan: pesan,
        items: meta.items,
        thumbnail: meta?.thumbnail,
        ShopId : meta?.shopId
      };
    }

    if (user) {
      navigate("/address", {
        state: { selectedProduct: finalDataToSend },
      });
    } else {
      showAlert("Silakan login terlebih dahulu.");
      navigate("/login");
    }
  };
  console.log("Selected Product:", selectedProduct);
  return (
    <div>
      <section className="Confirmation-MainSection">
        <div className="Confirmation-box"></div>
        <div className="Confirmation-SectionContainer">
          <div className="Confirmation-Back-Container" style={{ display : "flex", justifyContent : "flex-start", alignItems : "center", width : "100%", height : "10px" }}>
            <button className="TernaryBackButton" onClick={handleGoBack}>
            ←
            </button>
          </div>
          <div className="Confirmation-MainBox">
            <div className="Confirmation-ModelBox">
              <div
                style={{ height: "100%", width: "100%", borderRadius: "15px" }}
              >
                {!selectedProduct ? (
                  /* Kondisi A: Menampilkan Canvas */
                  // <Canvas>
                  //   <ambientLight intensity={0.8} />
                  //   <pointLight position={[10, 10, 10]} />
                  //   {modelScene && (
                  //     <primitive object={modelScene} scale={0.8} />
                  //   )}
                  //   <OrbitControls />
                  // </Canvas>
                  <img
                    src={meta?.thumbnail || ""}
                    alt="Model Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  /* Kondisi B: Menampilkan Gambar */
                  <img
                    src={selectedProduct.image}
                    alt="Model Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>
            </div>
            <div className="Confirmation-InfoBox">
              <div className="Confirmation-FillerBox"></div>
              <div className="Confirmation-InsideBox">
                <div className="Confirmation-NameBox">
                  <h1>{selectedProduct?.title || "Customized Bouquet"}</h1>
                </div>
                <div className="Confirmation-DetailBox">
                  <p>
                    {selectedProduct?.description ||
                      meta?.summary.map(
                        (item, index) =>
                          /* Hanya tampilkan jika qty lebih besar dari 0 */
                          item.qty > 0 && (
                            <div key={index} className="Confirmation-summary-item">
                              {/* <p style={{ fontSize: '15px', fontWeight: '500' }}> */}
                              {item.name} x{item.qty}
                              {/* </p> */}
                            </div>
                          )
                      )}
                    <br />
                  </p>
                </div>
                <div className="Confirmation-SummaryBox">
                  <div className="Confirmation-QtyBox">
                    <h2>x 1</h2>
                  </div>
                  <div className="Confirmation-PriceBox">
                    <h2>
                      Rp.{" "}
                      {selectedProduct?.price ||
                        meta?.totalPrice.toLocaleString("id-ID")}
                    </h2>
                  </div>
                </div>
                <div className="Confirmation-Message">
                  <div className="Confirmation-input-group">
                    <label htmlFor="pesan" className="Confirmation-input-label Confirmation-label">
                      pesan untuknya
                    </label>
                    <input
                      type="text"
                      id="pesan"
                      className="Confirmation-input-field-customizer Confirmation-input"
                      value={pesan}
                      maxLength={100}
                      onChange={(e) => setPesan(e.target.value)}
                    />
                  </div>
                </div>
                <div className="Confirmation-Message">
                  <div className="Confirmation-input-group">
                    <label
                      htmlFor="catatan"
                      className="Confirmation-input-label Confirmation-label"
                    >
                      catatan pesanan
                    </label>
                    <input
                      type="text"
                      id="catatan"
                      className="Confirmation-input-field-customizer Confirmation-input"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                    />
                  </div>
                </div>
                {/* <div className="Confirmation-Voucher">
                  <div className="Confirmation-input-group">
                    <label
                      htmlFor="voucher"
                      className="Confirmation-input-label Confirmation-label"
                    >
                      kode voucher
                    </label>
                    <input
                      type="text"
                      id="voucher"
                      className="Confirmation-input-field-customizer Confirmation-input"
                      value={voucher}
                      onChange={(e) => setVoucher(e.target.value)}
                    />
                  </div>
                </div> */}
                {/* <div className="Confirmation-NotesBox">
                  Notes :
                  <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptatem, magni?</p>
                </div> */}
                <div
                  className="Confirmation-btnContainer"
                  // style={{
                  //   display: "flex",
                  //   justifyContent: "center",
                  //   paddingTop: "30px",
                  // }}
                >
                  <button
                    className="Confirmation-btnConfirm"
                    onClick={() => handleCardSelect(selectedProduct)}
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
              <div className="Confirmation-FillerBox"></div>
            </div>
          </div>
        </div>
        <div className="Confirmation-box"></div>
      </section>
    </div>
  );
}

export default function Confirmation() {
  const { showAlert } = useAlert();
  const selectedProduct =
    window.history.state &&
    window.history.state.usr &&
    window.history.state.usr.selectedProduct;
  // console.log("Selected Product in Confirmation Page:", selectedProduct);

  const navigate = useNavigate();

  const handleEmpty = (meta, selectedProduct) => {
    if (!meta && !selectedProduct) {
      showAlert("Data produk tidak ditemukan. Silahkan ulangi dari awal.");

      navigate("/profile", { replace: true });
    }
  };
  // useEffect(() => {
  //   if (!selectedProduct) {
  //     showAlert("Data produk tidak ditemukan. Silahkan ulangi dari awal.");

  //     navigate("/profile", { replace: true });
  //   }
  // }, [selectedProduct, navigate]);

  const [modelScene, setModelScene] = useState(null);
  const [meta, setMeta] = useState(null);

  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    showLoading("Menyiapkan data ...");
    const loadFromDB = async () => {
      // 1. Ambil Metadata
      let savedMetaDB;
      if(!selectedProduct){
        savedMetaDB = await getDb("pending_order_meta");
        setMeta(savedMetaDB);
      }
      
      handleEmpty(savedMetaDB, selectedProduct)

      if (!savedMetaDB && !selectedProduct) {
        // Jika tidak ada data, arahkan kembali ke customizer
        showAlert("Keranjang kosong, silakan buat desain terlebih dahulu.");
        navigate("/customizer");
        return;
      }

      // console.log("Nama Buket : ", meta.modelName);
      // console.log("Question : ", meta.question);
      // console.log("Answer : ", meta.answer);

      // 2. Ambil Data Model
      let savedModelDB;
      if(!selectedProduct){
        savedModelDB = await getDb("pending_order_model");
        // setMeta(savedMetaDB);
      }
      const data = savedModelDB;

      if (data) {
        const loader = new GLTFLoader();

        // JIKA DATA ADALAH ARRAYBUFFER (Hasil binary: true)
        // Gunakan method .parse() bukan .load()
        loader.parse(
          data,
          "", // path dasar kosong
          (gltf) => {
            // Atur posisi/skala agar terlihat di preview tengah
            gltf.scene.position.set(0, -1, 0);
            setModelScene(gltf.scene);
          },
          (error) => {
            console.error("❌ Error parsing GLTF:", error);
          }
        );
      }
    };

    loadFromDB();
    hideLoading();
  }, []);
  // const navigate = useNavigate();
  useEffect(() => {
    const loadAndDestroy = async () => {
      if(!selectedProduct){      
        const data = await getDb("pending_order_model");
        const meta = await getDb("pending_order_meta");

        if (!data && !selectedProduct) {
          // Jika tidak ada data, arahkan kembali ke customizer
          showAlert("Keranjang kosong, silakan buat desain terlebih dahulu.");
          navigate("/customizer");
          return;
        }

        // 1. Simpan ke State untuk ditampilkan
        const loader = new GLTFLoader();
        loader.parse(data, "", (gltf) => {
          setModelScene(gltf.scene);
        });
        setMeta(meta);

        // 2. LANGSUNG HAPUS dari IndexedDB
        // Sekarang data hanya hidup di memori RAM (React State)
        // await delDb('pending_order_model');
        // await delDb('pending_order_meta');
        console.log("🗑️ Data IndexedDB dihapus demi keamanan.");
      }
    };

    loadAndDestroy();
  }, []);

  const handleBackToEditor = () => {
    // Navigasi balik saja, data di IndexedDB tidak dihapus
    // agar MainSection bisa memuatnya kembali.
    navigate("/customizer");
  };

  console.log("Meta Data:", meta);

  return (
    <div>
      <MainSection
        selectedProduct={selectedProduct}
        modelScene={modelScene}
        meta={meta}
      />
    </div>
  );
}
