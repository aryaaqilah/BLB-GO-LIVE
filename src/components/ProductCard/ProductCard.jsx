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

  const handleCardSelect = (card) => {
    if (user) {
      console.log("Selected card:", card);
      navigate("/confirmation", {
        state: { selectedProduct: card },
      });
    } else {
      navigate("/login");
      showAlert("Silakan login terlebih dahulu untuk melakukan pembelian.");
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