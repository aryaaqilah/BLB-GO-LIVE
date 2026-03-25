import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUpload, FaCheckCircle, FaCube } from "react-icons/fa";
import { AuthContext } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";

// Komponen Loading Lokal
const SectionLoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
    <div className="spinner"></div>
  </div>
);

const FloristManageItem = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { showLoading: showGlobalLoading, hideLoading: hideGlobalLoading } = useLoading();

  // State Lokal
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    Name: "",
    Price: "",
    Stok: "",
    ComponentId: null, 
  });

  const [availableComponents, setAvailableComponents] = useState([]);
  const [showComponentPicker, setShowComponentPicker] = useState(false);

  const fetchData = useCallback(async () => {
    setIsInitialLoading(true);
    try {
      // 1. Ambil daftar komponen (Asset 3D)
      const compRes = await fetch("http://localhost:5000/api/components");
      const compData = await compRes.json();
      setAvailableComponents(compData);

      // 2. Jika Mode Edit, ambil data item tersebut
      if (id) {
        const itemRes = await fetch(`http://localhost:5000/api/items/${id}`);
        const itemData = await itemRes.json();
        if (itemRes.ok) {
          setFormData({
            Name: itemData.Name,
            Price: itemData.Price,
            Stok: itemData.Stok,
            ComponentId: itemData.ComponentId, 
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      // Matikan loading lokal
      setIsInitialLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectComponent = (comp) => {
    setFormData((prev) => ({ ...prev, ComponentId: comp }));
    setShowComponentPicker(false);
  };

  const handleSave = async () => {
    if (!formData.Name || !formData.Price || !formData.Stok) {
      return showAlert("Mohon lengkapi detail item Anda.");
    }

    // Gunakan global loading hanya saat klik tombol "Simpan"
    showGlobalLoading("Menyimpan data...");
    const method = id ? "PUT" : "POST";
    const url = id 
      ? `http://localhost:5000/api/items/${id}` 
      : `http://localhost:5000/api/items`;

    const payload = {
      ...formData,
      ComponentId: formData.ComponentId?._id || null,
      ShopId: user?._id,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showAlert(id ? "Item berhasil diperbarui!" : "Item baru berhasil ditambahkan!");
        navigate("/inventory");
      } else {
        throw new Error();
      }
    } catch (err) {
      showAlert("Terjadi kesalahan saat menyimpan.");
    } finally {
      hideGlobalLoading();
    }
  };

  return (
    <div className="FloristManageItemContainer">
      <button className="TernaryBackButton" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      <h2 className="FloristManageItemTitle">
        {id ? `Edit Item #${id.substring(id.length - 5).toUpperCase()}` : "Tambah Item Baru"}
      </h2>

      {isInitialLoading ? (
        <SectionLoading />
      ) : (
        <div className="FloristManageItemFormSection">
          <div className="FloristManageItemInputGroup">
            <label>Nama Item</label>
            <input 
              type="text" 
              name="Name" 
              value={formData.Name} 
              onChange={handleInputChange} 
              placeholder="Masukkan nama bunga atau aksesoris..."
            />
          </div>

          {/* ASSET 3D DROPDOWN SELECTION */}
          <div className="FloristManageItemInputGroup">
            <label>Asset 3D Item (Opsional)</label>
            <select 
              className="FloristAssetDropdown"
              value={formData.ComponentId?._id || ""}
              onChange={(e) => {
                const selected = availableComponents.find(c => c._id === e.target.value);
                setFormData(prev => ({ ...prev, ComponentId: selected || null }));
              }}
            >
              <option value="">-- Pilih Asset 3D --</option>
              {availableComponents.map((comp) => (
                <option key={comp._id} value={comp._id}>
                  {comp.Name}
                </option>
              ))}
            </select>

            {/* PREVIEW ASSET YANG DIPILIH */}
            {formData.ComponentId && (
              <div className="FloristSelectedAssetPreview">
                <div className="PreviewImageFrame">
                   <img 
                    src={`http://localhost:5000${formData.ComponentId.Image}`} 
                    alt="Preview" 
                    onError={(e) => e.target.src = 'https://via.placeholder.com/100?text=No+Image'}
                   />
                </div>
                <div className="PreviewInfo">
                  <p className="weight-bold">{formData.ComponentId.Name}</p>
                  <p className="p3">Asset ini akan muncul di Customizer 3D</p>
                </div>
                <button 
                  className="RemoveAssetBtn"
                  onClick={() => setFormData(prev => ({ ...prev, ComponentId: null }))}
                >
                  Batal Pilih
                </button>
              </div>
            )}
          </div>

          <div className="FloristManageItemRow">
            <div className="FloristManageItemInputGroup">
              <label>Harga</label>
              <input type="number" name="Price" value={formData.Price} onChange={handleInputChange} placeholder="Rp" />
            </div>
            <div className="FloristManageItemInputGroup">
              <label>Stok</label>
              <input type="number" name="Stok" value={formData.Stok} onChange={handleInputChange} placeholder="0" />
            </div>
          </div>

          <div className="FloristManageItemAction">
            <button className="FloristManageItemSubmitBtn" onClick={handleSave}>
              Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloristManageItem;