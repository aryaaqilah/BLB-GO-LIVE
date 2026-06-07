import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";
import { AuthContext } from "../../contexts/AuthContext";

const AdminManageOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: admin } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const { showLoading, hideLoading } = useLoading();
  const [formData, setFormData] = useState({ Status: 0, ShippingCode: "", Service: "" });

  useEffect(() => {
    const fetchOrder = async () => {
      showLoading("Memuat...");
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${id}`);
        const data = await res.json();
        if (res.ok) setFormData({ Status: data.Status, ShippingCode: data.DeliveryId?.ShippingCode || "", Service: data.DeliveryId?.Service || "" });
      } finally { hideLoading(); }
    };
    fetchOrder();
  }, [id]);

  const handleSave = async () => {
    showLoading("Menyimpan...");
    try {
      const res = await fetch(`http://localhost:5000/api/orders/update-status/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetch("http://localhost:5000/api/changelogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            AdminId: admin._id,
            TargetId: id,
            TargetType: 'Order',
            TargetName: `Order #${id.slice(-6).toUpperCase()}`,
            Action: 'Update'
          }),
        });
        showAlert("Pesanan diperbarui!");
        navigate("/admin/orders");
      }
    } finally { hideLoading(); }
  };

  return (
    <div className="FloristManageBouquetContainer">
      <button className="TernaryBackButton" onClick={() => navigate(-1)}><FaArrowLeft /></button>
      <h2 className="FloristManageBouquetTitle">Edit Pesanan #{id.slice(-6).toUpperCase()}</h2>
      <div className="FloristManageBouquetForm">
        <div className="FloristInputGroup">
          <label>Status</label>
          <select value={formData.Status} onChange={e => setFormData({...formData, Status: parseInt(e.target.value)})}>
            <option value={0}>Menunggu</option><option value={1}>Berhasil</option><option value={2}>Diproses</option><option value={3}>Dikirim</option><option value={4}>Selesai</option><option value={5}>Batal</option>
          </select>
        </div>
        <div className="FloristInputGroup"><label>Layanan</label><input type="text" value={formData.Service} onChange={e => setFormData({...formData, Service: e.target.value})} /></div>
        <div className="FloristInputGroup"><label>Resi</label><input type="text" value={formData.ShippingCode} onChange={e => setFormData({...formData, ShippingCode: e.target.value})} /></div>
        <div className="FloristActionCenter" style={{ marginTop: '2rem' }}><button className="FloristSubmitBtn" onClick={handleSave}>Update</button></div>
      </div>
    </div>
  );
};

export default AdminManageOrder;