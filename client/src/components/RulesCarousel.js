import React, { useState } from 'react';
import './styles/RulesCar.css';

const RulesCarousel = ({ rules }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % rules.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + rules.length) % rules.length);
  };

  return (
    <div className="carousel">
      <div className="carousel-content">
        <button className="carousel-prev" onClick={prevSlide}>
          &#8592;
        </button>
        <div className="carousel-inner">
          <img src={rules[currentIndex].image} alt={`Rule ${currentIndex + 1}`} />
        </div>
        <button className="carousel-next" onClick={nextSlide}>
          &#8594;
        </button>
      </div>
      <div className="carousel-text">
        <p className="ruleText">{rules[currentIndex].text}</p>
      </div>
      <div className="carousel-indicators">
        {rules.map((_, index) => (
          <div
            key={index}
            className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default RulesCarousel;