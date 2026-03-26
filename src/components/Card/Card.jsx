import React from 'react';
import PropTypes from 'prop-types';
import { CardModel } from '../../models/CardModel';
import Logo from "../../assets/Logo/Logo_Secondary_Dark.png"
import './Card.css';

const Card = ({ isActive, onClick, cardModel, onSelect }) => (
  <div className={`card ${isActive ? 'active' : 'inactive'}`} onClick={onClick}>
    {isActive ? (
      <>
        <img src={`${cardModel.image}`} alt={cardModel.title} className="bouquet-image" />
        <div className="card-content">
          <div className="title-price">
            <h2 className='txt-color-primary'>{cardModel.title}</h2>
            <p className="txt-color-ternary">{cardModel.price}</p>
          </div>
          <p className="txt-color-ternary">{cardModel.description}</p>
          <button className="button-primary-fill p1" onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}>Beli</button>
        </div>
      </>
    ) : (
      <div className="logo-container">
        <img src={ Logo } alt="Logo" className="logo-image" />
      </div>
    )}
  </div>
);

Card.propTypes = {
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  cardModel: PropTypes.instanceOf(CardModel).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default Card;