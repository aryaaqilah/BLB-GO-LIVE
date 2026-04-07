import React, { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OrbitControls, Text, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { set as setDb, get as getDb } from "idb-keyval";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";
import { FaCamera, FaTrash } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate, faHand } from "@fortawesome/free-solid-svg-icons";

function Object3DModel({
  id,
  modelPath,
  position,
  mode,
  setDragging,
  type,
  isSelected,
  onSelect,
  parcelColor,
  ribbonColor,
}) {
  const { scene } = useGLTF(modelPath);
  const modelRef = useRef();
  const { camera, gl } = useThree();

  useEffect(() => {
    if (!scene || !modelRef.current) return;
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });

    if (type === "flower") {
      if (modelPath.includes("tulip")) cloned.scale.set(0.15, 0.15, 0.15);
      else if (modelPath.includes("rose")) cloned.scale.set(1.1, 1.1, 1.1);
      else if (modelPath.includes("lilly")) cloned.scale.set(1.5, 1.5, 1.5);
      else cloned.scale.set(0.5, 0.5, 0.5);
    }
    if (type === "Wrapper") cloned.scale.set(2.0, 2.0, 2.0);

    if (type === "Wrapper") {
      const parcels = cloned.getObjectByName("Parcels");
      const ribbon = cloned.getObjectByName("Ribbon");
      if (parcels) {
        parcels.traverse((child) => {
          if (child.isMesh) {
            child.material = child.material.clone();
            child.material.color = new THREE.Color(parcelColor || "#ffffff");
          }
        });
      }
      if (ribbon) {
        ribbon.traverse((child) => {
          if (child.isMesh) {
            child.material = child.material.clone();
            child.material.color = new THREE.Color(ribbonColor || "#ff0000");
          }
        });
      }
    }
    modelRef.current.clear && modelRef.current.clear();
    while (modelRef.current.children.length)
      modelRef.current.remove(modelRef.current.children[0]);
    modelRef.current.add(cloned);
  }, [scene, type, modelPath, parcelColor, ribbonColor]);

  useEffect(() => {
    if (!modelRef.current) return;
    modelRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.emissive = new THREE.Color(
          isSelected ? 0x00ff00 : 0x000000,
        );
      }
    });
  }, [isSelected]);

  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleClick = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(model, true);
      if (intersects.length > 0) onSelect(id);
    };
    gl.domElement.addEventListener("click", handleClick);
    return () => gl.domElement.removeEventListener("click", handleClick);
  }, [camera, gl, id, onSelect]);

  useEffect(() => {
    if (mode === "camera") return;
    const model = modelRef.current;
    if (!model) return;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const offset = new THREE.Vector3();
    const intersection = new THREE.Vector3();
    let isActive = false;

    const handleMouseDown = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(model, true);
      if (intersects.length > 0) {
        isActive = true;
        setDragging(true);
        if (mode === "drag") {
          plane.setFromNormalAndCoplanarPoint(
            camera.getWorldDirection(new THREE.Vector3()),
            model.position,
          );
          raycaster.ray.intersectPlane(plane, intersection);
          offset.copy(intersection).sub(model.position);
        }
      }
    };
    const handleMouseMove = (event) => {
      if (!isActive) return;
      if (mode === "drag") {
        const rect = gl.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        raycaster.ray.intersectPlane(plane, intersection);
        model.position.copy(intersection.sub(offset));
      } else {
        if (mode === "rotateX") model.rotation.x += event.movementY * 0.01;
        if (mode === "rotateY") model.rotation.y += event.movementX * 0.01;
        if (mode === "rotateZ") model.rotation.z += event.movementX * 0.01;
      }
    };
    const handleMouseUp = () => {
      isActive = false;
      setDragging(false);
    };
    gl.domElement.addEventListener("mousedown", handleMouseDown);
    gl.domElement.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("mouseup", handleMouseUp);
    return () => {
      gl.domElement.removeEventListener("mousedown", handleMouseDown);
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mode, camera, gl, setDragging]);

  return <group ref={modelRef} position={position} />;
}

function SceneContent({ children, sceneRef }) {
  const exportGroupRef = useRef();
  useEffect(() => {
    if (exportGroupRef.current) sceneRef.current = exportGroupRef.current;
  }, [sceneRef]);
  return <group ref={exportGroupRef}>{children}</group>;
}

const GalleryCard = ({ name, imageSrc, onAddObject, path }) => {
  const isWrapper = name === "Wrapper";
  const topBgColor = isWrapper ? "#c0c0c0" : "#e3e3e3";
  const bottomBgColor = isWrapper ? "#808080" : "#b0afa9";

  return (
    <div
      className="Customizer-gallery-card-btn"
      onClick={() => onAddObject(name, path)}
    >
      <div className="Customizer-card-bg">
        <div
          className="Customizer-bg-top"
          style={{ backgroundColor: topBgColor }}
        ></div>

        
      <div
          className="Customizer-bg-bottom"
          style={{ backgroundColor: bottomBgColor }}
        >
          {/* <span className="Customizer-label-text"></span> */}
        </div>

      </div>
        <img
        src={imageSrc}
        className="Customizer-card-img"
        style={{ width: isWrapper ? "110%" : "85%" }}
      />

      <div className="" style={{ position: "absolute", bottom: "5px", width: "100%", textAlign: "center" , zIndex: 10}}>
        <span className="Customizer-label-text">{`+ ${name}`}</span>
      </div>

    </div>
  );
};

const FlowerGallery = ({ onAddObject, components }) => {
  return (
    <div className="Customizer-gallery-container">
      {components.map((obj) => (
        <GalleryCard
          key={obj.ItemId}
          name={obj.Name}
          imageSrc={obj.Image}
          path={obj.Asset}
          onAddObject={onAddObject}
        />
      ))}
    </div>
  );
};

const ColorSelector = ({ title, colors, selectedColor, onColorChange }) => (
  <div className="Customizer-color-selector-group">
    <h3 className="Customizer-selector-title">{title}</h3>
    <div className="Customizer-color-bar-container">
      {colors && colors.length > 0 ? (
        colors.map((color) => (
          <div
            key={color.id}
            className="Customizer-color-swatch-Wrapper"
            onClick={() => onColorChange(color.hex)}
          >
            <div
              className={`Customizer-color-swatch ${color.hex === selectedColor ? "selected" : ""}`}
              style={{ backgroundColor: color.hex }}
            ></div>
          </div>
        ))
      ) : (
        <span style={{ color: "#ccc", fontSize: "12px" }}>Memuat...</span>
      )}
    </div>
    <style>{`
        .Customizer-color-selector-group { display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 10px; }
        .Customizer-selector-title { font-family: 'Times New Roman', serif; font-size: 18px; margin-bottom: 8px; }
        .Customizer-color-bar-container { display: flex; align-items: center; background-color: #808080; border-radius: 20px; padding: 8px 10px; gap: 10px; }
        .Customizer-color-swatch-Wrapper { cursor: pointer; }
        .Customizer-color-swatch { width: 30px; height: 30px; border-radius: 50%; border: 3px solid transparent; box-sizing: border-box; }
        .Customizer-color-swatch.selected { border-color: #d19077; box-shadow: 0 0 0 1px #d19077; }
        @media (max-width: 600px){ .Customizer-color-selector-group { align-items: center; } }
    `}</style>
  </div>
);

const ColorChoose = ({
  parcelColor,
  setParcelColor,
  ribbonColor,
  setRibbonColor,
  wrappers,
  ribbons,
}) => (
  <div
    style={{
      display: "flex",
      gap: "20px",
      justifyContent: "center",
      width: "100%",
    }}
  >
    <ColorSelector
      title="warna Wrapper"
      colors={wrappers}
      selectedColor={parcelColor}
      onColorChange={setParcelColor}
    />
    <ColorSelector
      title="warna ribbon"
      colors={ribbons}
      selectedColor={ribbonColor}
      onColorChange={setRibbonColor}
    />
  </div>
);

function MainSection({ storeId }) {
  const shopId = storeId;
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { showLoading, hideLoading } = useLoading();

  const [objects, setObjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("camera");
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showRotateMenu, setShowRotateMenu] = useState(false);
  const [parcelColor, setParcelColor] = useState("");
  const [ribbonColor, setRibbonColor] = useState("");
  const [modelName, setModelName] = useState("");
  const [components, setComponents] = useState([]);
  const [dynamicWrappers, setDynamicWrappers] = useState([]);
  const [dynamicRibbons, setDynamicRibbons] = useState([]);
  const sceneRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      showLoading("Menyiapkan data model...");
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/items/shop/${shopId}`,
        );
        const dataShop = await response.json();
        const flowerList = [];
        const wrapperList = [];
        const ribbonList = [];

        

        dataShop.forEach((item) => {
          if ((item.Type === "Non-Custom" || item.Type === "Other") && item.Stok > 0) {
            flowerList.push({
              Name: item.Name,
              Asset: item.ComponentId?.Asset,
              Image: item.ComponentId?.Image,
              Price: item.Price,
              ItemId: item._id,
            });
          } else if (item.Type === "Wrapper" && item.Stok > 0) {
            wrapperList.push({
              id: item._id,
              hex: item.HexCode,
              label: item.Name,
              price: item.Price,
            });
          } else if (item.Type === "Ribbon" && item.Stok > 0) {
            ribbonList.push({
              id: item._id,
              hex: item.HexCode,
              label: item.Name,
              price: item.Price,
            });
          }
        });
        
        

        if (
          flowerList.length === 0 ||
          wrapperList.length === 0 ||
          ribbonList.length === 0
        ) {
          hideLoading();
          showAlert(
            "Maaf, kustomisasi tidak tersedia karena stok material habis.",
          );
          navigate(-1);
          return;
        }

        setComponents(flowerList);
        setDynamicWrappers(wrapperList);
        setDynamicRibbons(ribbonList);
        if (wrapperList.length > 0) setParcelColor(wrapperList[0].hex);
        if (ribbonList.length > 0) setRibbonColor(ribbonList[0].hex);
        const saved = await getDb("pending_order_meta");

        if (!saved) {
          setObjects([
            {
              id: "base-wrapper",
              type: "Wrapper",
              modelPath: "/models/wrapper.glb",
              position: [0, 0, 0],
            },
          ]);
        }
      } catch (error) {
        console.error(error);
      }
      hideLoading();
    };
    fetchData();
  }, [shopId, navigate, showAlert]);

  const summaryData = useMemo(() => {
    const summary = components
      .map((comp) => {
        const count = objects.filter(
          (obj) => obj.modelPath === comp.Asset,
        ).length;
        return {
          name: comp.Name,
          qty: count,
          price: count * (comp.Price || 0),
          ItemId: comp.ItemId,
        };
      })
      .filter((item) => item.qty > 0);

    const selW = dynamicWrappers.find((w) => w.hex === parcelColor);
    if (selW)
      summary.push({
        name: selW.label,
        qty: 1,
        price: selW.price,
        ItemId: selW.id,
      });
    const selR = dynamicRibbons.find((r) => r.hex === ribbonColor);
    if (selR)
      summary.push({
        name: selR.label,
        qty: 1,
        price: selR.price,
        ItemId: selR.id,
      });
    return summary;
  }, [
    components,
    objects,
    dynamicWrappers,
    dynamicRibbons,
    parcelColor,
    ribbonColor,
  ]);

  const totalPrice = useMemo(
    () => summaryData.reduce((sum, item) => sum + item.price, 0),
    [summaryData],
  );

  const handleSave = async () => {
    if (objects.length <= 1)
      return showAlert("⚠️ Tambahkan bunga terlebih dahulu!");
    if (!modelName) return showAlert("Mohon lengkapi nama buket!");
    setShowGrid(false);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const screenshot = document.querySelector("canvas")?.toDataURL("image/png");
    setShowGrid(true);

    const exporter = new GLTFExporter();
    exporter.parse(
      sceneRef.current,
      async (result) => {
        try {
          await setDb("pending_order_model", result);
          await setDb("pending_order_meta", {
            objects,
            summary: summaryData,
            totalPrice,
            parcelColor,
            ribbonColor,
            modelName,
            shopId,
            thumbnail: screenshot,
            items: summaryData.map((s) => ({
              ItemId: s.ItemId,
              Quantity: s.qty,
            })),
            timestamp: Date.now(),
          });
          navigate("/confirmation");
        } catch (err) {
          showAlert("Gagal memproses model 3D.");
        }
      },
      { binary: true },
    );
  };

  return (
    <div>
      <section className="Customizer-MainSection">
        <div className="Customizer-box"></div>
        <div className="Customizer-SectionContainer">
          <div
            className="Confirmation-Back-Container"
            style={{
              display: "flex",
              justifyContent: "flex-start",
              width: "100%",
              padding: "20px",
            }}
          >
            <button className="TernaryBackButton" onClick={() => navigate(-1)}>
              {" "}
              ←{" "}
            </button>
          </div>
          <div className="Customizer-MainBox">
            <div
              className="Customizer-ModelBox border-4 border-gray-1000 rounded-lg overflow-hidden"
              style={{ position: "relative" }}
            >
              <div className="Customizer-canvas-toolbar">
                <button
                  className={`Customizer-toolbar-btn ${mode === "camera" ? "active" : ""}`}
                  onClick={() => setMode("camera")}
                >
                  <FaCamera />
                </button>
                <button
                  className="Customizer-toolbar-btn"
                  onClick={() => {
                    setObjects((prev) =>
                      prev.filter((o) => o.id !== selectedId),
                    );
                    setSelectedId(null);
                  }}
                >
                  <FaTrash />
                </button>
                <button
                  className={`Customizer-toolbar-btn ${mode === "drag" ? "active" : ""}`}
                  onClick={() => setMode("drag")}
                >
                  <FontAwesomeIcon icon={faHand} />
                </button>
                <div className="Customizer-rotate-menu-Wrapper">
                  <button
                    className={`Customizer-toolbar-btn ${
                      ["rotateX", "rotateY", "rotateZ"].includes(mode) ? "active" : ""
                    }`}
                    onClick={() => setShowRotateMenu(!showRotateMenu)}
                  >
                    <FontAwesomeIcon icon={faRotate} />
                  </button>
                  {showRotateMenu && (
                    <div className="Customizer-rotate-submenu">
                      {["X", "Y", "Z"].map((axis) => (
                        <button
                          key={axis}
                          className={`Customizer-submenu-btn ${
                            mode === `rotate${axis}` ? "active" : ""
                          }`}
                          onClick={() => setMode(`rotate${axis}`)}
                        >
                          {axis}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Canvas
                camera={{ position: [1, 3, 4] }}
                gl={{ preserveDrawingBuffer: true }}
                onPointerMissed={() => setSelectedId(null)}
              >
                <color attach="background" args={["#fdfdfd"]} />
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} intensity={1} />
                <SceneContent sceneRef={sceneRef}>
                  {objects.map((obj) => (
                    <Object3DModel
                      key={obj.id}
                      {...obj}
                      mode={mode}
                      setDragging={setIsDragging}
                      parcelColor={parcelColor}
                      ribbonColor={ribbonColor}
                      isSelected={selectedId === obj.id}
                      onSelect={setSelectedId}
                    />
                  ))}
                </SceneContent>
                {showGrid && <gridHelper args={[20, 20, 0x888888, 0x444444]} />}
                <OrbitControls
                  enabled={mode === "camera" && !isDragging}
                  enableZoom={false}
                />
              </Canvas>
            </div>
            <div className="Customizer-InfoBox">
              <div
                style={{
                  display: "flex",
                  alignSelf: "flex-start",
                  paddingLeft: "5%",
                  fontSize: "32px",
                  paddingBottom: "10px",
                }}
              >
                <span>Tentukan bunga</span>
                <span style={{ color: "#ffffff" }}>-</span>
                <span style={{ color: "#A95C4C" }}> pilihan mu</span>
              </div>
              <div className="Customizer-Message">
                <div className="Customizer-input-group">
                  <label className="Customizer-input-label Customizer-label-nama">
                    nama buket
                  </label>
                  <input
                    type="text"
                    className="Customizer-input-field-customizer Customizer-input-nama"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                  />
                </div>
              </div>
              <div
                  className="Customizer-AddModel"
                  style={{
                    width: "90%",
                    position: "relative",
                    zIndex: 5,
                    opacity: modelName ? 1 : 0.5,
                    pointerEvents: modelName ? "auto" : "none", // 🔥 ini kunci
                  }}
                >
                   {!modelName && (
                  <div
                    style={{
                      color: "#A95C4C",
                      fontSize: "13px",
                      marginBottom: "8px",
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    Isi nama buket terlebih dahulu untuk memilih bunga 🌸
                  </div>
                )}
                <FlowerGallery
                  onAddObject={(name, path) => {
                    if (!modelName) {
                      showAlert("Isi nama buket dulu ya 😊");
                      return;
                    }

                    setObjects((prev) => [
                      ...prev,
                      {
                        id: Date.now(),
                        type: "flower",
                        modelPath: path,
                        position: [prev.length * 0.1, 0.5, 0],
                      },
                    ]);
                  }}
                  components={components}
                />
              </div>
              <div
                className="Customizer-colorAndPrice"
                style={{ marginTop: "10px" }}
              >
                <div className="Customizer-Color">
                  <ColorChoose
                    parcelColor={parcelColor}
                    setParcelColor={setParcelColor}
                    ribbonColor={ribbonColor}
                    setRibbonColor={setRibbonColor}
                    wrappers={dynamicWrappers}
                    ribbons={dynamicRibbons}
                  />
                </div>
                <div
                  className="Customizer-order-summary-container"
                   style={{
                    padding: "5px",
                    clear: "both",
                    maxHeight: "130px",   // 👈 batas tinggi
                    overflowY: "auto",    // 👈 aktifkan scroll
                  }}
                >
                  <h3
                    style={{
                      borderBottom: "1px solid #ccc",
                      paddingBottom: "2px",
                    }}
                  >
                    Rincian Pesanan
                  </h3>
                  {summaryData.map((item, index) => (
                    <div key={index} style={{ marginBottom: "5px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: "bold",
                        }}
                      >
                        <span>{item.name}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          paddingLeft: "15px",
                        }}
                      >
                        <span>x{item.qty}</span>
                        <span>{item.price.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  ))}
                  <div
                    style={{
                      borderTop: "2px solid #000",
                      marginTop: "10px",
                      paddingTop: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: "bold",
                    }}
                  >
                    <span>Total Harga</span>
                    <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div
        className="Customizer-btnContainer"
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          paddingBottom: "40px",
        }}
      >
        <button className="Customizer-btnAddress" onClick={handleSave}>
          {" "}
          Selesai{" "}
        </button>
      </div>
    </div>
  );
}

export default function Customizer() {
  const storeId =
    window.history.state?.usr?.storeId || "69a581ef883533f34a8dc3b0";
  return <MainSection storeId={storeId} />;
}
