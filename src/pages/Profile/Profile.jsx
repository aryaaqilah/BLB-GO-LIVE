import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrderCard from "../../components/Order Card/OrderCard";
import { FaUser, FaEdit, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";

const SectionError = ({ onRetry }) => (
  <div style={{ textAlign: "center", padding: "3rem" }}>
    <p className="p1 txt-color-ternary" style={{ marginBottom: "1.5rem" }}>
      Oops... terjadi kesalahan silakan coba lagi
    </p>
    <button className="RoundedButtonPrimary" onClick={onRetry}>
      Coba Lagi
    </button>
  </div>
);

const SectionLoading = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "5rem" }}>
    <div className="spinner"></div>
  </div>
);

const Profile = () => {
  const { user, logout, login: updateAuthContext } = useAuth();
  const { showAlert } = useAlert();
  const { showLoading: showGlobalLoading, hideLoading: hideGlobalLoading } =
    useLoading();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const mapOrderToPresentation = (order) => {
    if (!order || !order.ProductId || !order.AddressId || !order.DeliveryId)
      return null;

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

    console.log("Mapping order:", order);

    const itemsDetails =
      order.ProductId?.ProductDetail?.map((detail) => {
        const itemName = detail.ItemId?.Name || "Item";
        const qty = detail.Quantity || 0;
        return `${itemName} (x${qty})`;
      }) || [];

    console.log(itemsDetails);

    const productDetails = order.ProductId?.ProductDetail;

    const items = productDetails.map((i) => ({
      ItemId: i._id, // dari ProductDetail
      Quantity: i.Quantity,
      ItemStokId: i.ItemId._id, // dari nested ItemId object
    }));

    return {
      orderId: order._id,
      statusInt: order.Status,
      status: statusProfileLabels[order.Status] || "Diproses",
      recipientName: order.AddressId?.RecipientName || "Guest",
      recipientPhone: order.AddressId?.RecipientNumber || "-",
      fullAddress: addressParts.join(", "),
      shippingCode: order.DeliveryId?.ShippingCode || "-",
      deliveryService: order.DeliveryId?.Service || "Standard",
      estimatedArrival: new Date(
        order.DeliveryId?.EstimatedArrival,
      ).toLocaleDateString(),
      productName: order.ProductId?.Name || "Product",
      productImageUrl: order.ProductId?.Image || "",
      quantity: order.ProductId?.Quantity || 1,
      customizationDetails:
        order.ProductId?.ProductDetail?.map(
          (d) => `${d.ItemId?.Name} (x${d.Quantity})`,
        ) || [],
      subtotalProduct: formatCurrency(order.ProductPrice),
      shippingFee: formatCurrency(order.DeliveryId?.Price || 0),
      serviceFee: formatCurrency(order.AdministrationFee?.Fee || 0),
      totalOrder: formatCurrency(order.Total || 0),

      threeDPath: order.ProductId?.ThreeDModel?._id || "",
      token: order.Token || "",
      statusPembayaran: order.StatusPembayaran || "Belum Dibayar",
      customerRequestNote: order.Notes || "Tidak ada catatan",
      productDetails: items, // untuk update stok nanti
    };
  };

  const fetchProfileData = async () => {
    if (!user?._id) return;
    setIsError(false);
    setIsLoading(true);

    try {
      // Backend harus melakukan deep populate: ProductId -> ProductDetail -> ItemId
      const response = await fetch(
        `http://localhost:5000/api/users/orders/${user._id}`,
      );
      if (!response.ok) throw new Error();
      const data = await response.json();

      console.log(data)
      setOrders()
      setProfileData({ data: data, loading: false, error: false });
      if (data.Orders && Array.isArray(data.Orders)) {
        setOrders(data.Orders);
      } else if (Array.isArray(data)) {
        setOrders(data);
      }
      setFormData({
        name: data.Name || "",
        email: data.Email || "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setIsError(true);
      setProfileData({ data: null, loading: false, error: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user?._id]);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profileData.data?.Name || "",
      email: profileData.data?.Email || "",
      password: "",
      confirmPassword: "",
    });
  };

  const isPasswordValid =
    formData.password !== "" &&
    formData.password === formData.confirmPassword &&
    /^[a-zA-Z0-9]+$/.test(formData.password);
  const canSave =
    isEditing &&
    isPasswordValid &&
    formData.name.trim() !== "" &&
    formData.email.trim() !== "";

  const handleSave = async () => {
    showGlobalLoading("Memperbarui Profil...");
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${user._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: formData.name,
            Email: formData.email,
            Password: formData.password,
          }),
        },
      );
      if (response.ok) {
        const updatedUser = await response.json();
        updateAuthContext(updatedUser);
        setIsEditing(false);
        showAlert("Profil diperbarui!");
        window.location.reload(); // Paksa reload jika memang masih glitch untuk sinkronisasi state
      }
    } catch (error) {
      showAlert("Gagal menyimpan.");
    } finally {
      hideGlobalLoading();
    }
  };

  if (isLoading) return <SectionLoading />;
  if (isError) return <SectionError onRetry={() => window.location.reload()} />;

  return (
    <div className="ProfilePageContainer">
      <button className="TernaryBackButton" onClick={() => navigate(-1)}>
        ←
      </button>
      <div className="ProfileSection">
        <div className="ProfileHeader">
          <div className="ProfileInfo">
            <FaUser className="ProfileIcon" />
            <div>
              <h1 className="txt-color-ternary">{formData.name}</h1>
              <p className="p1 txt-color-ternary">{formData.email}</p>
            </div>
          </div>
          <div className="ProfileActions">
            <FaEdit
              onClick={() => setIsEditing(true)}
              style={{
                color: isEditing ? "var(--color-primary)" : "inherit",
                cursor: "pointer",
              }}
            />
            <FaSignOutAlt
              onClick={() => {
                logout();
                navigate("/");
              }}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>

        <div className="ProfileUserDetail">
          <div className="ProfileDetailRow">
            <div className="ProfileLabel">
              <label>Nama</label>
              <input
                name="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                readOnly={!isEditing}
                className={!isEditing ? "read-only-input" : ""}
              />
            </div>
            <div className="ProfileLabel">
              <label>Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                readOnly={!isEditing}
                className={!isEditing ? "read-only-input" : ""}
              />
            </div>
          </div>
          {isEditing && (
            <div className="ProfileDetailRow">
              <div className="ProfileLabel">
                <label>Password Baru</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <div className="ProfileLabel">
                <label>Konfirmasi Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="ProfileEditButtonsContainer">
            <button
              className="button-ternary"
              onClick={() => setIsEditing(false)}
            >
              Batal
            </button>
            <button className="button-primary" onClick={handleSave}>
              Simpan
            </button>
          </div>
        )}

        <div className="MyOrderSection">
          <h2 className="txt-color-ternary">Pesanan Saya</h2>
          {orders.length > 0 ? (
            orders.map((order) => {
              const presented = mapOrderToPresentation(order);
              return presented ? (
                <OrderCard key={order._id} order={presented} />
              ) : null;
            })
          ) : (
            <p className="txt-color-ternary">Belum ada pesanan.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
