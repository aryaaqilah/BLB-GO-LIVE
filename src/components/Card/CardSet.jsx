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
    console.log("Card clicked:", card);
    setActiveIndex(index);
  };

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

  // Proteksi jika data cards belum termuat
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