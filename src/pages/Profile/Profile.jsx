import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "../../components/Order Card/OrderCard";
import { FaUser, FaEdit, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";

const SectionError = ({ onRetry }) => (
  <div style={{ textAlign: 'center', padding: '3rem' }}>
    <p className="p1 txt-color-ternary" style={{ marginBottom: '1.5rem' }}>
      Oops... terjadi kesalahan silakan coba lagi
    </p>
    <button className="rounded-button-primary" onClick={onRetry}>
      Coba Lagi
    </button>
  </div>
);

const SectionLoading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
    <div className="spinner"></div>
  </div>
);

const Profile = () => {
  const { user, logout, login: updateAuthContext } = useAuth();
  const { showAlert } = useAlert();
  const { showLoading: showGlobalLoading, hideLoading: hideGlobalLoading } = useLoading();
  const navigate = useNavigate();

  const [profileState, setProfileState] = useState({
    data: null,
    loading: true,
    error: false
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const mapOrderToPresentation = (order) => {
    if (!order || !order.ProductId || !order.AddressId || !order.DeliveryId) return null;

    const statusProfileLabels = {
      0: "Pesanan Dibuat", 
      1: "Pembayaran Berhasil", 
      2: "Pesanan Disiapkan", 
      3: "Pesanan Dikirim", 
      4: "Pesanan Tiba",
    };

    const addressParts = [
      order.AddressId?.Detail,
      order.AddressId?.DistrictId?.district_name,
      order.AddressId?.CityId?.city_name,
      order.AddressId?.ProvinceId?.province_name,
    ].filter(Boolean);

    console.log("Mapping order:", order); // Debug log untuk melihat struktur data order

    // Proses Detail Produk (Rincian Item)
    const itemsDetails = order.ProductId?.ProductDetail?.map(detail => {
      const itemName = detail.ItemId?.Name || "Item";
      const qty = detail.Quantity || 0;
      return `${itemName} (x${qty})`;
    }) || [];

    console.log(itemsDetails)

    return {
      orderId: order._id || "N/A",
      statusInt: typeof order.Status === "number" ? order.Status : 0,
      status: statusProfileLabels[order.Status] || "Diproses",
      
      recipientName: order.AddressId?.RecipientName || "Guest",
      recipientPhone: order.AddressId?.RecipientNumber || "-",
      fullAddress: addressParts.length > 0 ? addressParts.join(", ") : "Alamat tidak tersedia",
      
      shippingCode: order.DeliveryId?.ShippingCode || "-",
      deliveryService: order.DeliveryId?.Service || "Standard",
      estimatedArrival: formatDate(order.DeliveryId?.EstimatedArrival),
      
      productName: order.ProductId?.Name || "Customized Bouquet",
      productImageUrl: order.ProductId?.Image || "",
      quantity: order.ProductId?.Quantity || 1,
      customizationDetails: itemsDetails,
      
      // Biaya-biaya
      subtotalProduct: formatCurrency(order.ProductPrice),
      shippingFee: formatCurrency(order.DeliveryId?.Price || 0),
      serviceFee: formatCurrency(order.AdministrationFee?.Fee || 0),
      totalOrder: formatCurrency(order.Total || 0),
      
      threeDPath: order.ProductId?.ThreeDModel?._id || "",
      token : order.Token || "",
      statusPembayaran: order.StatusPembayaran || "Belum Dibayar",
      customerRequestNote: order.Notes || "Tidak ada catatan"
    };
  };

  const fetchProfileData = async () => {
    if (!user?._id) return;
    setProfileState(prev => ({ ...prev, loading: true, error: false }));
    
    try {
      // Backend harus melakukan deep populate: ProductId -> ProductDetail -> ItemId
      const response = await fetch(`http://localhost:5000/api/users/orders/${user._id}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      setProfileState({ data, loading: false, error: false });
      setFormData({
        name: data.Name || "",
        email: data.Email || "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setProfileState({ data: null, loading: false, error: true });
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?._id]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profileState.data?.Name || "",
      email: profileState.data?.Email || "",
      password: "",
      confirmPassword: "",
    });
  };

  const isPasswordValid = formData.password !== "" && formData.password === formData.confirmPassword && /^[a-zA-Z0-9]+$/.test(formData.password);
  const canSave = isEditing && isPasswordValid && formData.name.trim() !== "" && formData.email.trim() !== "";

  const handleSave = async () => {
    if (!canSave) return;
    showGlobalLoading("Memperbarui Profil...");
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name: formData.name, Email: formData.email, Password: formData.password }),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        updateAuthContext(updatedUser);
        setIsEditing(false);
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        showAlert("Profil berhasil diperbarui!");
        fetchProfileData();
      }
    } catch (error) {
      showAlert("Gagal menyimpan.");
    } finally {
      hideGlobalLoading();
    }
  };

  const handleLogout = () => {
    showAlert({
      msg: "Apakah anda yakin ingin keluar?",
      confirmText: "Ya, Keluar",
      cancelText: "Batal",
      onConfirm: () => {
        logout();
        navigate("/");
      }
    });
  };

  return (
    <div className="ProfilePageContainer">
      <button className="TernaryBackButton" onClick={() => navigate(-1)}>←</button>

      {profileState.loading ? (
        <SectionLoading />
      ) : profileState.error ? (
        <SectionError onRetry={fetchProfileData} />
      ) : (
        <div className="ProfileSection">
          <div className="ProfileHeader">
            <div className="ProfileInfo">
              <FaUser className="ProfileIcon" />
              <div>
                <h1 className="txt-color-ternary">{formData.name || "User"}</h1>
                <p className="p1 txt-color-ternary">{formData.email}</p>
              </div>
            </div>
            <div className="ProfileActions">
              <FaEdit onClick={() => setIsEditing(true)} style={{ color: isEditing ? "var(--color-primary)" : "inherit", cursor: "pointer" }} />
              <FaSignOutAlt onClick={handleLogout} style={{ cursor: "pointer" }} />
            </div>
          </div>

          <div className="ProfileUserDetail">
            <div className="ProfileDetailRow">
              <div className="ProfileLabel txt-color-ternary">
                <label>Nama</label>
                <input name="name" value={formData.name} onChange={handleInputChange} readOnly={!isEditing} className={!isEditing ? "read-only-input" : ""} />
              </div>
              <div className="ProfileLabel txt-color-ternary">
                <label>Email</label>
                <input name="email" value={formData.email} onChange={handleInputChange} readOnly={!isEditing} className={!isEditing ? "read-only-input" : ""} />
              </div>
            </div>
            <div className="ProfileDetailRow">
              <div className="ProfileLabel txt-color-ternary">
                <label>Password Baru</label>
                <input name="password" type="password" placeholder={isEditing ? "Alfanumerik" : "********"} value={formData.password} onChange={handleInputChange} readOnly={!isEditing} className={!isEditing ? "read-only-input" : ""} />
              </div>
              <div className="ProfileLabel txt-color-ternary">
                <label>Konfirmasi Password</label>
                <input name="confirmPassword" type="password" placeholder={isEditing ? "Ulangi Password" : "********"} value={formData.confirmPassword} onChange={handleInputChange} readOnly={!isEditing} className={!isEditing ? "read-only-input" : ""} />
              </div>
            </div>
            {isEditing && !isPasswordValid && formData.password !== "" && <p className="ErrorMessage">Password harus alfanumerik dan cocok.</p>}
          </div>

          {isEditing && (
            <div className="ProfileEditButtonsContainer">
              <button className="button-ternary" onClick={handleCancel}>Batal</button>
              <button className="button-primary" onClick={handleSave} disabled={!canSave}>Simpan Perubahan</button>
            </div>
          )}

          <div className="MyOrderSection">
            <h2 className="txt-color-ternary">Pesanan Saya</h2>
            {profileState.data?.Orders?.length > 0 ? (
              profileState.data.Orders
                .map(order => mapOrderToPresentation(order))
                .filter(presentedOrder => presentedOrder !== null)
                .map(presentedOrder => (
                  <OrderCard key={presentedOrder.orderId} order={presentedOrder} />
                ))
            ) : (
              <p className="txt-color-ternary">Belum ada pesanan.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;