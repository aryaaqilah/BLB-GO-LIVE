import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { AuthContext } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";

const SectionLoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
    <div className="spinner"></div>
  </div>
);

const FloristManageOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { showLoading, hideLoading } = useLoading();

  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    customerName: "",
    productName: "",
    productImage: "",
    address: "",
    status: 0,
  shippingCode: "",
  trackingLink: "",
  service: ""
  });

  // 🔥 FETCH ORDER DETAIL
  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}`);
      const data = await res.json();

      console.log("Fetched order data:", data); // Debug log

      const addressParts = [
      data.AddressId?.Detail,
      data.AddressId?.DistrictId?.district_name,
      data.AddressId?.CityId?.city_name,
      data.AddressId?.ProvinceId?.province_name,
      data.AddressId?.PostalCodeId
    ].filter(Boolean);

      if (res.ok) {
        setFormData({
          customerName: data.UserId?.Name || "-",
          productName: data.ProductId?.Name || "Custom Bouquet",
          productImage: data.ProductId?.Image
            ? `${data.ProductId.Image}`
            : "/no-image.png",
          address: addressParts.join(", ") || "-",
          status: data.Status,
          shippingCode: data.DeliveryId.ShippingCode || "-",
          trackingLink: data.DeliveryId.TrackingLink || "-",
          service: data.DeliveryId.Service || "-"
        });
      } else {
        showAlert("Gagal mengambil data order");
      }
    } catch {
      showAlert("Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
    }
  }, [id, showAlert]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // 🔥 HANDLE SAVE (UPDATE STATUS SAJA)
    const handleSave = async () => {
    showLoading("Menyimpan perubahan...");

    try {
        const res = await fetch(`http://localhost:5000/api/orders/update-status/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            Status: formData.status,
            ShippingCode: formData.shippingCode,
            TrackingLink: formData.trackingLink,
            Service: formData.service
        })
        });

        if (res.ok) {
        showAlert("Data berhasil diperbarui!");
        navigate(-1);
        } else {
        showAlert("Gagal update");
        }
    } catch {
        showAlert("Terjadi kesalahan koneksi");
    } finally {
        hideLoading();
    }
    };

  return (
    <div className="FloristManageBouquetContainer">
      <button className="TernaryBackButton" onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      <h2 className="FloristManageBouquetTitle">
        Pesanan #{id.slice(-6)}
      </h2>

      {isLoading ? <SectionLoading /> : (
        <div className="FloristManageBouquetForm">

          {/* NAMA PEMBELI */}
          <div className="FloristInputGroup">
            <label>Nama Pembeli</label>
            <input type="text" value={formData.customerName} disabled />
          </div>

          {/* PESANAN */}
          <div className="FloristInputGroup">
            <label>Pesanan</label>
            <input type="text" value={formData.productName} disabled />
          </div>

          {/* FOTO PRODUK */}
          <div className="FloristInputGroup">
            <label>Foto Produk</label>
            <div className="FloristImageUploader" style={{ cursor: "default" }}>
              <img
                src={formData.productImage}
                alt="product"
                className="PreviewImg"
              />
            </div>
          </div>

          {/* ALAMAT */}
          <div className="FloristInputGroup">
            <label>Alamat</label>
            <input type="text" value={formData.address} disabled />
          </div>

          {/* STATUS */}
          <div className="FloristInputGroup">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: parseInt(e.target.value) })
              }
            >
              <option value={0}>Menunggu</option>
              <option value={1}>Diproses</option>
              <option value={2}>Selesai</option>
            </select>
          </div>
          {/* SERVICE */}
            <div className="FloristInputGroup">
            <label>Service Pengiriman</label>
            <input
                type="text"
                value={formData.service}
                onChange={(e) =>
                setFormData({ ...formData, service: e.target.value })
                }
                placeholder="Contoh: JNE REG"
            />
            </div>

            {/* SHIPPING CODE */}
            <div className="FloristInputGroup">
            <label>Kode Resi</label>
            <input
                type="text"
                value={formData.shippingCode}
                onChange={(e) =>
                setFormData({ ...formData, shippingCode: e.target.value })
                }
                placeholder="Masukkan kode resi"
            />
            </div>

            {/* TRACKING LINK */}
            <div className="FloristInputGroup">
            <label>Link Tracking</label>
            <input
                type="text"
                value={formData.trackingLink}
                onChange={(e) =>
                setFormData({ ...formData, trackingLink: e.target.value })
                }
                placeholder="https://..."
            />
            </div>

          <button className="FloristSubmitBtn" onClick={handleSave}>
            Simpan
          </button>

        </div>
      )}
    </div>
  );
};

export default FloristManageOrder;