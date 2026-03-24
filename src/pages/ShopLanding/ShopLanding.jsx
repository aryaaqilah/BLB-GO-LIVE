import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import { FaArrowLeft, FaStar } from "react-icons/fa";
import { useLoading } from "../../contexts/LoadingContext";
import { CardModel } from "../../models/CardModel";
import { StoreCardModel } from "../../models/StoreCardModel";

const dummyStores = [
  new StoreCardModel("1", "HER.ROSES Florist", "https://i.ibb.co/LzY8v1C/Logo-Placeholder.png"),
  new StoreCardModel("2", "FLORA.STUDIO", "https://i.ibb.co/LzY8v1C/Logo-Placeholder.png"),
];

const dummyProducts = [
  new CardModel("p1", "Buket Diah", "150", "Lorem ipsum dolor sit amet, consectetur adipiscing.", "https://via.placeholder.com/300", false),
  new CardModel("p2", "Mawar Putih", "200", "Simbol kesucian untuk yang terkasih.", "https://via.placeholder.com/300", false),
  new CardModel("p3", "Red Tulip", "180", "Keindahan tulip merah segar.", "https://via.placeholder.com/300", false),
];

const ShopLanding = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const [storeInfo, setStoreInfo] = useState(null);
  const [addressInfo, setAddressInfo] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchData = async () => {
      showLoading("Menyiapkan data florist...");

      try {
        const response = await fetch(
          `http://localhost:5000/api/shops/${storeId}`
        );
        const dataShop = await response.json();

        console.log("ini abis hit shop");
        console.log(dataShop);
        setStoreInfo(dataShop);

        // SECTION GET PROVINCE, CITY, DISTRICT =========================================================================
      const response2 = await fetch(
        `http://localhost:5000/api/provinces/${dataShop.Address.ProvinceId}`
      );
      if (!response.ok) {
        throw new Error("Gagal mengambil data provinsi");
      }
      const dataProv = await response2.json();

      const response3 = await fetch(
        `http://localhost:5000/api/cities/${dataShop.Address.CityId}`
      );
      if (!response2.ok) {
        throw new Error("Gagal mengambil data kota");
      }
      const dataCity = await response3.json();
      console.log("Hasil pencarian:", dataProv);

      const response4 = await fetch(
        `http://localhost:5000/api/districts/${dataShop.Address.DistrictId}`
      );
      if (!response3.ok) {
        throw new Error("Gagal mengambil data kecamatan");
      }
      const dataDistrict = await response4.json();

      console.log("Hasil pencarian:", dataProv);
      console.log("Hasil pencarian:", dataCity);
      console.log("Hasil pencarian:", dataDistrict);

      const addressData = {
        province: dataProv.provinsi_name,
        city: dataCity.city_name,
        district: dataDistrict.district_name
      }

      setAddressInfo(addressData);

      console.log("infooo ", addressInfo);

      const responseProduct = await fetch(
          `http://localhost:5000/api/products/shop/${storeId}`
        );
        const dataProduct = await responseProduct.json();

        console.log("ini abis hit shop");
        console.log(dataProduct);
        const objects = dataProduct.map((item) => ({
          key : "p",
          title : item.Name,
          price : item.Price,
          description : item.Memo,
          image : item.Image,
          truefalse : false
        }));
        setProducts(objects);
        console.log(products);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      }
    };

  useEffect(() => {
    showLoading("Menghubungi penjual...");
    
    fetchData();

    const timer = setTimeout(() => {
      // Logic Fix: If storeId is not found, use dummyStores[0] for testing purposes
      
      const selectedStore = dummyStores.find((s) => s._id === storeId) || dummyStores[0];
      
      // setStoreInfo(selectedStore);
      // setProducts(dummyProducts);
      
      hideLoading();
    }, 500);

    return () => clearTimeout(timer);
  }, [storeId]);

  // Prevent returning null; show a skeleton or return a fragment instead
  if (!storeInfo) return <div style={{ height: '100vh' }}></div>;

  return (
    <div className="ShopLandingContainer" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button className="TernaryBackButton" onClick={() => navigate(-1)} style={{ marginBottom: '2rem' }}>
        <FaArrowLeft />
      </button>
      
      <header className="ShopLandingHeader" style={{ display: 'flex', alignItems: 'center', gap: '2rem', borderBottom: '1px solid #eee', paddingBottom: '2rem', marginBottom: '3rem' }}>
        <img src={storeInfo.Logo} alt={storeInfo.Name} className="ShopLandingLogo" style={{ width: '120px', height: '120px', borderRadius: '50%' }} />
        <div className="ShopLandingDetails">
          <h1 className="h1 txt-color-primary">{storeInfo.Name}</h1>
          <p className="p2">Alamat: {addressInfo.city}, {addressInfo.province} </p>
          <p className="p2">No. Telepon: {storeInfo.PhoneNumber}</p>
          <div className="ShopLandingRatingRow" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <FaStar color="#FFD700" /> 
            <span className="p2 weight-semibold">4.9</span>
            <span className="p3 txt-color-bg-dark">(500 review)</span>
          </div>
        </div>
      </header>

      <section className="ShopLandingProductSection">
        <div className="ShopLandingProductTitle" style={{ marginBottom: '6rem' }}>
          <h2 className="h2">Produk Kami</h2>
          <p className="p2">Yang terbaik untuk yang terkasih</p>
        </div>
        
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8rem 2rem' }}>
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onSelect={(p) => navigate('/confirmation', { state: { selectedProduct: p }})} 
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ShopLanding;