import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import "./Card.css";
import { AuthContext } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";

const CardSet = ({ cards }) => {
  const { user } = useContext(AuthContext);
  const [activeIndex, setActiveIndex] = useState(0);
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const handleCardClick = (index, card) => {
    
    setActiveIndex(index);
  };

  const handleCardSelect = async (card) => {
    console.log("Selected card:", card);
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/products/get-by-id/${card.id}`
    );
    if (!response.ok) {
      throw new Error("Gagal mengambil data product");
    }
    const dataProduct = await response.json();
    console.log("Fetched product data:", dataProduct);

    const items = card.items || [];

    if (dataProduct.ProductDetail.length === 0 || dataProduct.ProductDetail === null) {
      showAlert("Produk tidak memiliki item.");
      return;
    }

    try {
      const responses = await Promise.all(
        dataProduct.ProductDetail.map((item) =>
          fetch(`${process.env.REACT_APP_API_URL}/api/items/${item.ItemId._id}`),
        ),
      );

      const dataResults = await Promise.all(responses.map((res) => res.json()));

      if (responses.some((res) => !res.ok)) {
        throw new Error("Gagal fetch salah satu item");
      }

      const hasInsufficientStock = dataProduct.ProductDetail.some((item) => {
        const stockData = dataResults.find(
          (data) => data._id === item.ItemId._id,
        );

        if (!stockData || !stockData.Stok) return true;

        return item.Quantity > stockData.Stok;
      });

      
      if (hasInsufficientStock) {
        showAlert("Stok tidak mencukupi untuk beberapa item.");
        return;
      }

      const updateStock = async (items, type) => {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/items/update-stock`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items, type }),
          },
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);
      };

      const result = dataProduct.ProductDetail.map(item => ({
        ItemId: item._id,
        ItemName: item.ItemId?.Name || "",
        ItemStokId: item.ItemId?._id || "",
        Quantity: item.Quantity
      }));

      if (user) {
        try {
          console.log("Updating stock for items:", dataProduct.ProductDetail);
          await updateStock(result, "decrease");
          localStorage.setItem("reservedItems", JSON.stringify(result));

          const finalDataToSend = {
            ...card,
            items : dataProduct.ProductDetail.map(item => ({
              ItemId: item._id,
              ItemName: item.ItemId?.Name || "",
              ItemStokId: item.ItemId?._id || "",
              Quantity: item.Quantity
            }))
          }

          navigate("/confirmation", {
            state: { selectedProduct: finalDataToSend, fromCheckout: true },

          });
        } catch (error) {
          console.error(error);
          showAlert("Terjadi kesalahan saat proses checkout.");
        }
      } else {
        navigate("/login");
        showAlert("Silakan login terlebih dahulu untuk melakukan pembelian.");
      }
    } catch (error) {
      console.error("Gagal cek stok:", error);
      showAlert("Terjadi kesalahan saat mengecek stok.");
    }
  };

  
  if (!cards || cards.length === 0) return null;

  return (
    <div className="card-set">
      {cards.map((card, index) => (
        <Card
          key={card.id || index}
          isActive={index === activeIndex}
          onClick={() => handleCardClick(index, card)}
          cardModel={card}
          onSelect={() => handleCardSelect(card)}
        />
      ))}
    </div>
  );
};

export default CardSet;