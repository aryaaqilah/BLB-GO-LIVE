import React, { useRef, useState, useLayoutEffect, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { useLoading } from "../../contexts/LoadingContext";
import { FaArrowLeft, FaStar } from "react-icons/fa";

const SectionError = ({ onRetry }) => (
  <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
    <p className="p1 txt-color-ternary" style={{ marginBottom: '1.5rem' }}>Oops... terjadi kesalahan saat memuat detail pesanan.</p>
    <button className="rounded-button-primary" onClick={onRetry}>Coba Lagi</button>
  </div>
);

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { showLoading, hideLoading } = useLoading();

  const [currentOrder, setCurrentOrder] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const trackerRef = useRef(null);
  const [progressWidth, setProgressWidth] = useState(0);
  const hasInquired = useRef(false);

  const steps = [
    { label: "Pesanan Dibuat" },
    { label: "Pembayaran Berhasil" },
    { label: "Pesanan Disiapkan" },
    { label: "Pesanan Dikirim" },
    { label: "Pesanan Tiba" }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(amount).replace("Rp", "IDR ");
  };

  const mapOrderToPresentation = useCallback((order) => {
    if (!order) return null;
    const statusLabels = { 0: "Pesanan Dibuat", 1: "Pembayaran Berhasil", 2: "Pesanan Disiapkan", 3: "Pesanan Dikirim", 4: "Pesanan Tiba" };

    const addressParts = [
      order.AddressId?.Detail,
      order.AddressId?.DistrictId?.district_name,
      order.AddressId?.CityId?.city_name,
      order.AddressId?.ProvinceId?.province_name,
      order.AddressId?.PostalCodeId,
    ].filter(Boolean);

    const productItems = order.ProductId?.ProductDetail?.map(detail => ({
      name: detail.ItemId?.Name || "Item",
      quantity: detail.Quantity || 0
    })) || [];

    return {
      id: order._id,
      statusInt: order.Status,
      statusLabel: statusLabels[order.Status] || "Diproses",
      recipientName: order.AddressId?.RecipientName || "Guest",
      recipientPhone: order.AddressId?.RecipientNumber || "-",
      recipientEmail: order.UserId?.Email || "-",
      fullAddress: addressParts.join(", "),
      shippingCode: order.DeliveryId?.ShippingCode || "-",
      deliveryService: order.DeliveryId?.Service || "Standard",
      estimatedArrival: new Date(order.DeliveryId?.EstimatedArrival).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      productName: order.ProductId?.Name || "Customized Bouquet",
      productImageUrl: order.ProductId?.Image || "",
      productQuantity: order.ProductId?.Quantity || 1,
      orderNotes: order.Notes || "tidak ada catatan",
      productPrice: formatCurrency(order.ProductPrice),
      shippingFee: formatCurrency(order.DeliveryId?.Price || 0),
      serviceFee: formatCurrency(order.AdministrationFee?.Fee || 0),
      totalOrder: formatCurrency(order.Total || 0),
      items: productItems
    };
  }, []);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;
    setIsPageLoading(true);
    setIsError(false);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
      const data = await response.json();
      const ratingRes = await fetch(`http://localhost:5000/api/ratings/check/${orderId}`);
      const ratingData = await ratingRes.json();

      if (response.ok) {
        setCurrentOrder(mapOrderToPresentation(data));
        setHasRated(ratingData.exists);
      } else throw new Error();
    } catch (err) {
      setIsError(true);
    } finally {
      setIsPageLoading(false);
    }
  }, [orderId, mapOrderToPresentation]);

  useEffect(() => {
    if (!hasInquired.current && orderId) {
      fetchOrderDetail();
      hasInquired.current = true;
    }
  }, [orderId, fetchOrderDetail]);

  useLayoutEffect(() => {
    if (trackerRef.current && currentOrder) {
      const containerWidth = trackerRef.current.clientWidth;
      const stepWidth = 24;
      const spaceBetween = (containerWidth - (5 * stepWidth)) / 4;
      const activePosition = currentOrder.statusInt * (stepWidth + spaceBetween) + stepWidth / 2;
      setProgressWidth(activePosition);
    }
  }, [currentOrder, isPageLoading]);

  const handleCompleteOrder = async () => {
    showLoading("Memproses...");
    try {
      const response = await fetch(`http://localhost:5000/api/orders/status/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Status: 4 }),
      });
      if (response.ok) {
        showAlert("Pesanan Selesai!");
        hasInquired.current = false;
        fetchOrderDetail();
      }
    } catch {
      showAlert("Gagal memperbarui status.");
    } finally { hideLoading(); }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) return showAlert("Silakan pilih rating bintang.");
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/ratings/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ OrderId: orderId, Rating: rating, Ulasan: comment }),
      });
      if (response.ok) {
        showAlert("Terima kasih!");
        setHasRated(true);
      }
    } catch {
      showAlert("Gagal mengirim ulasan.");
    } finally { setIsSubmitting(false); }
  };

  if (isPageLoading) return <div className="OrderDetailSection" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><div className="spinner"></div></div>;
  if (isError) return <div className="OrderDetailSection"><SectionError onRetry={fetchOrderDetail} /></div>;

  return (
    <div className="OrderDetailSection">
      <button className="PrimaryBackButton" onClick={() => navigate(-1)}><FaArrowLeft /></button>
      <h1 className="txt-color-primary">Detail Pesanan</h1>

      <div className="OrderDetailCard">
        <div className="OrderDetailCardHeaderRow">
          <span className="txt-color-ternary weight-semibold">Nomor Pesanan : #{currentOrder?.id.substring(0, 8).toUpperCase()}</span>
          <span className="txt-color-primary weight-bold">{currentOrder?.statusLabel}</span>
        </div>

        <div className="OrderTracker" ref={trackerRef}>
          <div className="OrderDetailTrackerLineBackground"></div>
          <div className="OrderDetailTrackerLineProgress" style={{ width: `${progressWidth}px` }}></div>
          {steps.map((step, index) => (
            <div key={index} className={`OrderDetailStepItem ${index <= currentOrder?.statusInt ? "active" : ""}`}>
              <div className={`OrderDetailStepCircle ${index <= currentOrder.statusInt ? "active" : ""}`}></div>
              <div className="txt-color-ternary step-label">
                {step.label.split(" ").map((word, i) => <span key={i}>{word}<br /></span>)}
              </div>
            </div>
          ))}
        </div>

        {currentOrder?.statusInt === 4 && !hasRated && (
          <div className="RatingInputSection">
            <hr className="RatingDivider" />
            <h3>Bagaimana kualitas bunga kami?</h3>
            <div className="StarContainer">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="StarIcon" color={(i + 1) <= (hover || rating) ? "#A65E4E" : "#e4e5e9"} onMouseEnter={() => setHover(i + 1)} onMouseLeave={() => setHover(0)} onClick={() => setRating(i + 1)} />
              ))}
            </div>
            <textarea className="RatingTextarea" placeholder="Tuliskan ulasan Anda..." value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="button-primary-fill" style={{ width: 'fit-content', padding: '0.8rem 2rem' }} onClick={handleSubmitRating}>Kirim Ulasan</button>
          </div>
        )}

        <div className="OrderDetailDeliverySummaryRow">
          <div style={{ flex: 1 }}>
            <h3>Ringkasan Pengiriman</h3>
            <div className="DeliveryInfoRow"><span className="label">Kode Pengiriman</span><span className="value">: {currentOrder?.shippingCode}</span></div>
            <div className="DeliveryInfoRow"><span className="label">Jasa</span><span className="value">: {currentOrder?.deliveryService}</span></div>
            <div className="DeliveryInfoRow"><span className="label">Estimasi Tiba</span><span className="value">: {currentOrder?.estimatedArrival}</span></div>
          </div>
          {currentOrder?.statusInt === 3 && (
            <button className="button-primary-fill" style={{ padding: '1rem 2rem', width: 'auto' }} onClick={handleCompleteOrder}>Pesanan Selesai</button>
          )}
        </div>
      </div>

      <div className="OrderDetailCard OrderDetailBottomCard txt-color-ternary">
        <div className="OrderDetailCustomerSection">
          <h3>Informasi Customer</h3>
          <div className="OrderDetailInfoGrid">
            <span className="label">Nama</span><span className="value">: {currentOrder?.recipientName}</span>
            <span className="label">Email</span><span className="value">: {currentOrder?.recipientEmail}</span>
            <span className="label">Nomor</span><span className="value">: {currentOrder?.recipientPhone}</span>
            <span className="label">Alamat</span><span className="value">: {currentOrder?.fullAddress}</span>
          </div>
          <button className="rounded-button-ternary-fill" style={{ width: 'fit-content' }}>Hubungi Admin</button>
        </div>

        <div>
          <h3>Ringkasan Pesanan</h3>
          <div className="OrderDetailProductItem">
            <img src={`http://localhost:5000${currentOrder?.productImageUrl}`} alt="Product" className="OrderDetailProductImage" />
            <div className="OrderDetailProductDetails">
              <h3 className="txt-color-primary">{currentOrder?.productName}</h3>
              <ul className="OrderDetailProductItems">
                {currentOrder?.items.map((item, i) => <li key={i} className="p3">- {item.name} (x{item.quantity})</li>)}
              </ul>
              <div className="OrderDetailQuantityRow"><span className="qty">x{currentOrder?.productQuantity}</span><span className="price-at-qty">{currentOrder?.productPrice}</span></div>
              <div className="OrderDetailNotes"><span className="p3 weight-bold">Catatan:</span><p className="p3">{currentOrder?.orderNotes}</p></div>
            </div>
          </div>
          <div className="OrderDetailPricingBreakdown">
            <div className="OrderDetailPriceRow"><span>Subtotal Produk</span><span>{currentOrder?.productPrice}</span></div>
            <div className="OrderDetailPriceRow"><span>Subtotal Pengiriman</span><span>{currentOrder?.shippingFee}</span></div>
            <div className="OrderDetailPriceRow"><span>Biaya Layanan</span><span>{currentOrder?.serviceFee}</span></div>
            <div className="OrderDetailPriceRow total"><h3 className="weight-bold">Total Pesanan</h3><h3 className="weight-bold txt-color-primary">{currentOrder?.totalOrder}</h3></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;