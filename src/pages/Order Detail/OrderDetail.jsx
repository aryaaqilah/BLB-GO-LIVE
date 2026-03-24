import React, { useRef, useState, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAlert } from "../../contexts/AlertContext";
import { FaArrowLeft, FaStar } from "react-icons/fa";

const OrderDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const currentOrder = location.state?.orderData;

  const [progressWidth, setProgressWidth] = useState(0);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trackerRef = useRef(null);

  // 0: Dibuat, 1: Bayar, 2: Siap, 3: Kirim, 4: Tiba
  const activeStepIndex = currentOrder?.statusInt ?? 0;
  const totalSteps = 5;

  const steps = [
    { label: "Pesanan Dibuat" },
    { label: "Pembayaran Berhasil" },
    { label: "Pesanan Disiapkan" },
    { label: "Pesanan Dikirim" },
    { label: "Pesanan Tiba" },
  ];

  useLayoutEffect(() => {
    if (trackerRef.current && currentOrder) {
      const container = trackerRef.current;
      const containerWidth = container.clientWidth;
      const stepWidth = 24;
      const totalItemWidth = totalSteps * stepWidth;
      const spaceBetween = (containerWidth - totalItemWidth) / (totalSteps - 1);
      const activePosition = activeStepIndex * (stepWidth + spaceBetween) + stepWidth / 2;
      setProgressWidth(activePosition);
    }
  }, [activeStepIndex, totalSteps, currentOrder]);

  const handleGoBack = () => navigate(-1);

  const handleCopyCode = () => {
    if (currentOrder?.shippingCode) {
      navigator.clipboard.writeText(currentOrder.shippingCode);
      showAlert("Kode pengiriman berhasil disalin!");
    }
  };

  // Fungsi saat user klik "Pesanan Selesai" (Update status dari 3 ke 4)
  const handleCompleteOrder = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/status/${currentOrder.orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Status: 4 }), // Update ke status "Tiba"
      });

      if (response.ok) {
        showAlert("Pesanan telah selesai. Terima kasih!");
        navigate("/profile"); // Kembali ke profil untuk refresh data
      }
    } catch (err) {
      showAlert("Gagal memperbarui status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) return showAlert("Silakan pilih bintang terlebih dahulu.");
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:5000/api/ratings/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          OrderId: currentOrder.orderId,
          Rating: rating,
          Ulasan: comment,
        }),
      });

      if (response.ok) {
        showAlert("Ulasan Anda sangat berarti bagi kami!");
        setRating(0);
        setComment("");
      } else {
        const errorData = await response.json();
        showAlert(errorData.error || "Gagal mengirim ulasan.");
      }
    } catch (err) {
      showAlert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentOrder) {
    return (
      <div className="OrderDetailSection">
        <p>Data pesanan tidak ditemukan.</p>
        <button onClick={handleGoBack} className="button-primary">Kembali</button>
      </div>
    );
  }

  return (
    <div className="OrderDetailSection">
      <button className="PrimaryBackButton" onClick={handleGoBack}><FaArrowLeft /></button>
      <h1 className="txt-color-primary">Detail Pesanan</h1>

      <div className="OrderDetailCard top-card">
        <div className="OrderDetailCardHeaderRow">
          <span className="txt-color-ternary weight-semibold">
            Nomor Pesanan : #{currentOrder.orderId.substring(0, 8).toUpperCase()}
          </span>
          {/* Lacak Pesanan Dihapus */}
          <span className="txt-color-primary weight-bold">{currentOrder.status}</span>
        </div>

        <div className="OrderTracker" ref={trackerRef}>
          <div className="OrderDetailTrackerLineBackground"></div>
          <div className="OrderDetailTrackerLineProgress" style={{ width: `${progressWidth}px` }}></div>

          {steps.map((step, index) => (
            <div key={index} className={`OrderDetailStepItem ${index <= activeStepIndex ? "active" : ""}`}>
              <div className={`OrderDetailStepCircle ${index <= activeStepIndex ? "active" : ""}`}></div>
              <div className="txt-color-ternary step-label">
                {step.label.split(" ").map((word, i) => (
                  <span key={i}>{word}<br /></span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* SECTION RATING: Muncul hanya jika status === 4 (Tiba) */}
        {activeStepIndex === 4 && (
          <div className="RatingInputSection">
            <hr className="RatingDivider" />
            <h3 className="txt-color-ternary">Bagaimana kualitas bunga kami?</h3>
            <div className="StarContainer">
              {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return (
                  <label key={index}>
                    <input type="radio" name="rating" value={ratingValue} onClick={() => setRating(ratingValue)} style={{ display: 'none' }} />
                    <FaStar 
                      className="StarIcon" 
                      color={ratingValue <= (hover || rating) ? "#A65E4E" : "#e4e5e9"} 
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                    />
                  </label>
                );
              })}
            </div>
            <textarea 
              className="RatingTextarea"
              placeholder="Tuliskan ulasan Anda..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="button-primary-fill" style={{ width: 'fit-content', padding: '0.8rem 2rem', marginTop: '1rem' }} onClick={handleSubmitRating} disabled={isSubmitting}>
              Kirim Ulasan
            </button>
          </div>
        )}

        <div className="OrderDetailDeliverySummaryRow">
          <div className="txt-color-ternary">
            <h3>Ringkasan Pengiriman</h3>
            <div className="DeliveryInfoRow">
              <span className="label">Kode Pengiriman</span>
              <span className="value">
                : {currentOrder.shippingCode}{" "}
                <button className="CopyButton" onClick={handleCopyCode}>Salin</button>
              </span>
            </div>
            <div className="DeliveryInfoRow">
              <span className="label">Jasa</span>
              <span className="value">: {currentOrder.deliveryService}</span>
            </div>
            <div className="DeliveryInfoRow">
              <span className="label">Estimasi Tiba</span>
              <span className="value">: {currentOrder.estimatedArrival}</span>
            </div>
          </div>

          {/* TOMBOL PESANAN SELESAI: Hanya muncul jika status === 3 (Dikirim) */}
          {activeStepIndex === 3 && (
            <div className="action-area">
              <button 
                className="button-primary-fill" 
                onClick={handleCompleteOrder}
                disabled={isSubmitting}
                style={{ padding: '1rem 2rem' }}
              >
                Pesanan Selesai
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="OrderDetailCard OrderDetailBottomCard txt-color-ternary">
        <div className="OrderDetailCustomerSection">
          <h3>Informasi Customer</h3>
          <div className="OrderDetailInfoGrid">
            <span className="label">Nama</span>
            <span className="value">: {currentOrder.recipientName}</span>
            <span className="label">Nomor</span>
            <span className="value">: {currentOrder.recipientPhone}</span>
            <span className="label">Alamat</span>
            <span className="value">: {currentOrder.fullAddress}</span>
          </div>
          <button className="rounded-button-ternary-fill" style={{ width: 'fit-content' }}>
            Hubungi Admin
          </button>
        </div>

        <div className="OrderSummaryContent">
          <h3>Ringkasan Pesanan</h3>
          <div className="OrderDetailProductItem">
            <img src={`http://localhost:5000${currentOrder.productImageUrl}`} alt="Product" className="OrderDetailProductImage" />
            <div className="OrderDetailProductDetails">
              <h3 className="txt-color-primary">{currentOrder.productName}</h3>
              <div className="OrderDetailQuantityRow">
                <span className="qty">x{currentOrder.quantity}</span>
                <span className="price-at-qty">{currentOrder.subtotalProduct}</span>
              </div>
              <div className="OrderDetailNotes">
                <span className="p3 weight-bold">Catatan :</span>
                <p className="p3">{currentOrder.customerRequestNote || "tidak ada catatan"}</p>
              </div>
            </div>
          </div>

          <div className="OrderDetailPricingBreakdown">
            <div className="OrderDetailPriceRow"><span>Subtotal Produk</span><span>{currentOrder.subtotalProduct}</span></div>
            <div className="OrderDetailPriceRow"><span>Subtotal Pengiriman</span><span>{currentOrder.shippingFee}</span></div>
            <div className="OrderDetailPriceRow"><span>Biaya Layanan</span><span>{currentOrder.serviceFee}</span></div>
            <div className="OrderDetailPriceRow"><span>Diskon</span><span style={{ color: 'green' }}>{currentOrder.discount}</span></div>
            <div className="OrderDetailPriceRow total">
              <h3 className="weight-bold">Total Pesanan</h3>
              <h3 className="weight-bold txt-color-primary">{currentOrder.totalOrder}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;