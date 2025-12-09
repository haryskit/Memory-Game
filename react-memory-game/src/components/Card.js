import React from 'react';
import '../styles/Card.css';

function Card({ value, index, isFlipped, isMatched, onClick }) {
  return (
    <div
      className={`card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
      onClick={onClick}
      data-value={value}
      data-index={index}
    >
      <div className="card-face card-front"></div>
      <div className="card-face card-back">{value}</div>
    </div>
  );
}

export default Card;

