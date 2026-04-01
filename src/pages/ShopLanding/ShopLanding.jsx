import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import { FaArrowLeft, FaStar } from "react-icons/fa";
import { useLoading } from "../../contexts/LoadingContext";
import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";

const ShopLanding = () => {
  const { storeId } = useParams();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();

  const [storeInfo, setStoreInfo] = useState(null);
  const [addressInfo, setAddressInfo] = useState({
    province: "",
    city: "",
    district: "",
  });
  const [productState, setProductState] = useState({
    data: [],
    loading: true,
    error: false,
  });
  const [ratingState, setRatingState] = useState({
    data: [],
    loading: true,
    error: false,
  });
  const [totalRating, setTotalRating] = useState(0);

  
  const fetchStoreData = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/shops/${storeId}`,
      );
      if (!response.ok) throw new Error("Gagal mengambil data toko");
      const dataShop = await response.json();
      setStoreInfo(dataShop);

      
      const [resProv, resCity, resDist] = await Promise.all([
        fetch(
          `http://localhost:5000/api/provinces/${dataShop.Address.ProvinceId}`,
        ),
        fetch(`http://localhost:5000/api/cities/${dataShop.Address.CityId}`),
        fetch(
          `http://localhost:5000/api/districts/${dataShop.Address.DistrictId}`,
        ),
      ]);

      const [dataProv, dataCity, dataDist] = await Promise.all([
        resProv.json(),
        resCity.json(),
        resDist.json(),
      ]);

      setAddressInfo({
        province: dataProv.provinsi_name,
        city: dataCity.city_name,
        district: dataDist.district_name,
      });
    } catch (error) {
      console.error("❌ Error fetching shop data:", error);
    }
  }, [storeId]);

  
  const fetchRatings = useCallback(async () => {
    setRatingState((prev) => ({ ...prev, loading: true, error: false }));
    try {
      const res = await fetch(
        `http://localhost:5000/api/ratings/florist/${storeId}`,
      );
      const data = await res.json();
      if (res.ok) {
        const uniqueRatings = Array.from(
          new Map(data.map((item) => [item._id, item])).values(),
        );
        setRatingState({ data: uniqueRatings, loading: false, error: false });
        setTotalRating(uniqueRatings.length);
      } else throw new Error();
    } catch {
      setRatingState({ data: [], loading: false, error: true });
    }
  }, [storeId]);

  
  const fetchProducts = useCallback(async () => {
    setProductState((prev) => ({ ...prev, loading: true, error: false }));
    try {
      const responseProduct = await fetch(
        `http://localhost:5000/api/products/shop/${storeId}`,
      );
      if (!responseProduct.ok) throw new Error();
      const dataProduct = await responseProduct.json();

      const mappedProducts = dataProduct.map((item) => {
        const productType = item.Tipe || "Tidak Diketahui";
        const fullTitle = `${item.Name} (${productType})`;

        return {
          id: item._id,
          key: item._id,
          title: fullTitle,
          price: item.Price,
          description: item.Memo,
          image: item.Image,
          ShopId: storeId,
          items: Array.isArray(item.ProductDetail)
            ? item.ProductDetail.map((i) => ({
                ItemId: i._id,
                Quantity: i.Quantity,
                ItemStokId: i.ItemId?._id,
                ItemName: i.ItemId ? i.ItemId.Name : "Unknown Item",
              }))
            : [],
        };
      });

      setProductState({ data: mappedProducts, loading: false, error: false });
    } catch (error) {
      setProductState({ data: [], loading: false, error: true });
    }
  }, [storeId]);

  useEffect(() => {
    const loadAllData = async () => {
      showLoading("Menyiapkan data...");
      await Promise.all([fetchStoreData(), fetchProducts(), fetchRatings()]);
      hideLoading();
    };
    loadAllData();
  }, [storeId, fetchStoreData, fetchProducts, fetchRatings]);

  
  const handleCustom = () => {
    if (!user) {
      navigate("/login");
      return showAlert(
        "Silakan login terlebih dahulu untuk melakukan kustomisasi.",
      );
    }
    navigate("/customizer", { state: { storeId: storeId } });
  };

  const handleSelectProduct = (product) => {
    if (!user) {
      return showAlert("Silakan login terlebih dahulu untuk memesan produk.");
    }
    navigate("/confirmation", { state: { selectedProduct: product } });
  };

  
  const SectionError = ({ onRetry }) => (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p className="p1 txt-color-ternary" style={{ marginBottom: "1rem" }}>
        Gagal memuat data.
      </p>
      <button className="button-primary-fill" onClick={onRetry}>
        Coba Lagi
      </button>
    </div>
  );

  const SectionLoading = () => (
    <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
      <div className="spinner"></div>
    </div>
  );

  if (!storeInfo) return <div style={{ height: "100vh" }}></div>;

  

  return (
    <div
      className="ShopLandingContainer"
      style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}
    >
      <button
        className="TernaryBackButton"
        onClick={() => navigate(-1)}
        style={{ marginBottom: "2rem" }}
      >
        <FaArrowLeft />
      </button>

      <header
        className="ShopLandingHeader"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          borderBottom: "1px solid #eee",
          paddingBottom: "2rem",
          marginBottom: "3rem",
        }}
      >
        <img
          src={storeInfo.Logo}
          alt={storeInfo.Name}
          className="ShopLandingLogo"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <div className="ShopLandingDetails" style={{ width: "100%" }}>
          <h1 className="h1 txt-color-primary">{storeInfo.Name}</h1>
          <p className="p2">
            Alamat: {addressInfo.district}, {addressInfo.city},{" "}
            {addressInfo.province}{" "}
          </p>
          <p className="p2">No. Telepon: {storeInfo.PhoneNumber}</p>

          <div
            className="ShopLandingRatingRow"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "10px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FaStar color="#FFD700" />
              <span className="p2 weight-semibold">
                {ratingState.data.length > 0
                  ? (
                      ratingState.data.reduce((a, b) => a + b.Rating, 0) /
                      ratingState.data.length
                    ).toFixed(1)
                  : "0"}
              </span>
              <span className="p3 txt-color-bg-dark">
                ({totalRating} ulasan)
              </span>
            </div>

            {storeInfo.AcceptCustomization && (
              <div>
                <button className="button-primary-fill" onClick={handleCustom}>
                  Kreasikan Buket Mu
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="ShopLandingProductSection">
        <div
          className="ShopLandingProductTitle"
          style={{ marginBottom: "3rem" }}
        >
          <h2 className="h2">Produk Kami</h2>
          <p className="p2">Pilihan buket terbaik untuk momen spesialmu</p>
        </div>

        {productState.loading ? (
          <SectionLoading />
        ) : productState.error ? (
          <SectionError onRetry={fetchProducts} />
        ) : (
          <div
            className="product-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {productState.data.length > 0 ? (
              productState.data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={handleSelectProduct}
                />
              ))
            ) : (
              <p className="p1">Belum ada produk tersedia.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ShopLanding;
