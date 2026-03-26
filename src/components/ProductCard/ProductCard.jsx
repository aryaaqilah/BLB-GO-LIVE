import { useContext } from "react";
import React from 'react';
import { useNavigate } from "react-router-dom";
import './ProductCard.css';
import { AuthContext } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const handleCardSelect = async (card) => {
    const items = card.items || [];

    // ❗ Validasi awal
    if (items.length === 0) {
      showAlert("Produk tidak memiliki item.");
      return;
    }

    try {
      // 🔥 Ambil semua stok sekaligus
      const responses = await Promise.all(
        items.map(item =>
          fetch(`http://localhost:5000/api/items/${item.ItemStokId}`)
        )
      );

      const dataResults = await Promise.all(responses.map(res => res.json()));

      // ❗ Cek kalau ada request gagal
      if (responses.some(res => !res.ok)) {
        throw new Error("Gagal fetch salah satu item");
      }

      // ✅ Validasi stok (cek semua item)
      const hasInsufficientStock = items.some((item) => {
        const stockData = dataResults.find(
          data => data._id === item.ItemStokId
        );

        // ❗ kalau tidak ketemu atau stok tidak ada
        if (!stockData || !stockData.Stok) return true;

        return item.Quantity > stockData.Stok;
      });

      console.log("Data stok items:", dataResults);
      if (hasInsufficientStock) {
        showAlert("Stok tidak mencukupi untuk beberapa item.");
        return;
      }

      // ✅ Lanjut kalau semua stok aman
      if (user) {
        navigate("/confirmation", {
          state: { selectedProduct: card },
        });
      } else {
        navigate("/login");
        showAlert("Silakan login terlebih dahulu untuk melakukan pembelian.");
      }

    } catch (error) {
      console.error("Gagal cek stok:", error);
      showAlert("Terjadi kesalahan saat mengecek stok.");
    }
  };
  return (
    <div className="product-card">
      <div className="image-container">
        {/* The bouquet image that overlaps the top */}
        <img 
          src={
            product.image?.startsWith("data:image")
              ? product.image
              : `http://localhost:5000${product.image}`
          } 
          alt={product.title} 
          className="product-image-pop" 
        />
        
        {/* Price positioned inside the beige box */}
        <span className="price-overlay">
          IDR {product.price}
        </span>
      </div>

      <div className="product-info">
        <h2 className="txt-color-primary">{product.title}</h2>
        <p className="p2 txt-color-ternary">{product.description}</p>
        
        <button 
          className="button-primary-fill" 
          onClick={() => handleCardSelect(product)}
        >
          Beli
        </button>
      </div>
    </div>
  );
};

export default ProductCard;