import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUpload, FaTrash } from "react-icons/fa";
import { AuthContext } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";

const SectionLoading = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "300px",
    }}
  >
    <div className="spinner"></div>
  </div>
);

const FloristManageBouquet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { showLoading, hideLoading } = useLoading();

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [availableItems, setAvailableItems] = useState([]);
  const [formData, setFormData] = useState({
    Name: "",
    Price: 0,
    Memo: "",
    Tipe: "Segar",
    Image: null,
    PreviewImage: null,
    ProductDetail: [],
  });

  
  const calculateTotalPrice = useCallback(
    (details) => {
      return details.reduce((sum, current) => {
        const itemData = availableItems.find((i) => i._id === current.ItemId);
        const itemPrice = itemData ? itemData.Price : 0;
        return sum + itemPrice * current.Quantity;
      }, 0);
    },
    [availableItems],
  );

  const fetchData = useCallback(async () => {
    if (!user?._id) return;
    setIsInitialLoading(true);
    try {
      const itemsRes = await fetch(
        `${process.env.REACT_APP_API_URL}/api/items/florist/${user._id}`,
      );
      const itemsData = await itemsRes.json();
      setAvailableItems(itemsData);

      if (id) {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/products/get-by-id/${id}`);
        const data = await res.json();
        if (res.ok) {
          setFormData({
            Name: data.Name,
            Price: data.Price,
            Memo: data.Memo || "",
            Tipe: data.Tipe || "Segar",
            PreviewImage: data.Image,
            Image: null,
            ProductDetail: data.ProductDetail.map((d) => ({
              ItemId: d.ItemId?._id || d.ItemId,
              Name: d.ItemId?.Name || "Item",
              Quantity: d.Quantity,
            })),
          });
        }
      }
    } catch (err) {
      console.error("Gagal load data", err);
    } finally {
      setIsInitialLoading(false);
    }
  }, [id, user?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  useEffect(() => {
    const total = calculateTotalPrice(formData.ProductDetail);
    if (total !== formData.Price) {
      setFormData((prev) => ({ ...prev, Price: total }));
    }
  }, [formData.ProductDetail, calculateTotalPrice, formData.Price]);

  const handleAddItem = (itemId) => {
    const item = availableItems.find((i) => i._id === itemId);
    if (formData.ProductDetail.find((d) => d.ItemId === itemId))
      return showAlert("Item sudah ada dalam daftar.");
    setFormData((prev) => ({
      ...prev,
      ProductDetail: [
        ...prev.ProductDetail,
        { ItemId: itemId, Name: item.Name, Quantity: 1 },
      ],
    }));
  };

  const handleSave = async () => {
    if (!formData.Name || formData.ProductDetail.length === 0)
      return showAlert("Mohon lengkapi nama dan item penyusun!");

    showLoading("Menyimpan...");
    const data = new FormData();
    data.append("Name", formData.Name);
    data.append("Price", formData.Price);
    data.append("Memo", formData.Memo);
    data.append("Tipe", formData.Tipe);
    data.append("ShopId", user._id);
    data.append("IsCustomized", 0);
    data.append(
      "ProductDetail",
      JSON.stringify(
        formData.ProductDetail.map((d) => ({
          ItemId: d.ItemId,
          Quantity: d.Quantity,
        })),
      ),
    );

    if (formData.Image) data.append("Image", formData.Image);

    const url = id
      ? `${process.env.REACT_APP_API_URL}/api/products/get-by-id/${id}`
      : `${process.env.REACT_APP_API_URL}/api/products`;
    try {
      const res = await fetch(url, { method: id ? "PUT" : "POST", body: data });
      if (res.ok) {
        showAlert("Buket berhasil disimpan!");
        navigate("/inventory");
      }
    } catch {
      showAlert("Terjadi kesalahan koneksi.");
    } finally {
      hideLoading();
    }
  };

  const displayImage = useMemo(() => {
    if (!formData.PreviewImage) return null;
    if (
      formData.PreviewImage.startsWith("blob:") ||
      formData.PreviewImage.startsWith("data:")
    ) {
      return formData.PreviewImage;
    }
    const cleanPath = formData.PreviewImage.startsWith("/")
      ? formData.PreviewImage
      : `/${formData.PreviewImage}`;
    return `${process.env.REACT_APP_API_URL}${cleanPath}`;
  }, [formData.PreviewImage]);

  return (
    <div className="FloristManageBouquetContainer">
      <button className="TernaryBackButton" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>
      <h2 className="FloristManageBouquetTitle">
        {id ? "Edit Buket" : "Tambah Buket Baru"}
      </h2>

      {isInitialLoading ? (
        <SectionLoading />
      ) : (
        <div className="FloristManageBouquetForm">
          <div className="FloristInputGroup">
            <label>Nama Produk</label>
            <input
              type="text"
              value={formData.Name}
              onChange={(e) =>
                setFormData({ ...formData, Name: e.target.value })
              }
              placeholder="Nama Buket..."
            />
          </div>

          <div className="FloristInputGroup">
            <label>Tipe Buket</label>
            <select
              className="FloristItemDropdown"
              value={formData.Tipe}
              onChange={(e) =>
                setFormData({ ...formData, Tipe: e.target.value })
              }
            >
              <option value="Segar">Segar</option>
              <option value="Buatan">Buatan (Artificial)</option>
              <option value="Kering">Kering (Dried)</option>
            </select>
          </div>

          <div className="FloristInputGroup">
            <label>Foto Produk</label>
            <div
              className="FloristImageUploader"
              onClick={() => document.getElementById("fileInput").click()}
              style={{
                minHeight: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: "2px dashed #A65E4E",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#fcf8f7",
              }}
            >
              {displayImage ? (
                <img
                  src={displayImage}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/500x200?text=Gambar+Tidak+Ditemukan";
                  }}
                />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <FaUpload style={{ fontSize: "2rem", color: "#A65E4E" }} />
                  <p className="p3">Klik untuk Upload Foto</p>
                </div>
              )}
              <input
                type="file"
                id="fileInput"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file)
                    setFormData({
                      ...formData,
                      Image: file,
                      PreviewImage: URL.createObjectURL(file),
                    });
                }}
              />
            </div>
          </div>

          <div className="FloristInputGroup">
            <label>Item Penyusun</label>
            <div className="SelectedItemsList">
              {formData.ProductDetail.map((item, index) => (
                <div
                  key={index}
                  className="ItemRow"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    background: "#fcf8f7",
                    marginBottom: "5px",
                    borderRadius: "8px",
                    border: "1px solid #eee",
                  }}
                >
                  <span>{item.Name}</span>
                  <div
                    className="ItemActions"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      type="number"
                      min="1"
                      style={{
                        width: "50px",
                        marginRight: "10px",
                        padding: "5px",
                      }}
                      value={item.Quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ProductDetail: formData.ProductDetail.map((d) =>
                            d.ItemId === item.ItemId
                              ? {
                                  ...d,
                                  Quantity: parseInt(e.target.value) || 1,
                                }
                              : d,
                          ),
                        })
                      }
                    />
                    <FaTrash
                      style={{ color: "#A65E4E", cursor: "pointer" }}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          ProductDetail: formData.ProductDetail.filter(
                            (d) => d.ItemId !== item.ItemId,
                          ),
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <select
              className="FloristItemDropdown"
              onChange={(e) => handleAddItem(e.target.value)}
              value=""
              style={{ width: "100%", padding: "10px", marginTop: "10px" }}
            >
              <option value="" disabled>
                + Tambah Bahan dari Stok
              </option>
              {availableItems
                .filter(
                  (ai) =>
                    !formData.ProductDetail.find((pd) => pd.ItemId === ai._id),
                )
                .map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.Name} (Rp {i.Price.toLocaleString()})
                  </option>
                ))}
            </select>
          </div>

          <div className="FloristInputGroup">
            <label>Harga Jual (Otomatis)</label>
            <div
              className="AutoPriceBox"
              style={{
                background: "#fcf8f7",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: "bold",
                border: "1px solid #A65E4E",
                color: "#A65E4E",
              }}
            >
              Rp {formData.Price.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="FloristInputGroup">
            <label>Deskripsi / Memo</label>
            <textarea
              value={formData.Memo}
              onChange={(e) =>
                setFormData({ ...formData, Memo: e.target.value })
              }
              style={{
                minHeight: "100px",
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
              placeholder="Tuliskan deskripsi buket..."
            />
          </div>

          <div
            className="FloristActionCenter"
            style={{ marginTop: "20px", textAlign: "center" }}
          >
            <button
              className="FloristSubmitBtn"
              onClick={handleSave}
              style={{
                padding: "12px 60px",
                background: "#A65E4E",
                color: "white",
                border: "none",
                borderRadius: "25px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Simpan Produk
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloristManageBouquet;
