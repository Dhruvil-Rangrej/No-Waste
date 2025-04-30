import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css"; 

const HomePage = () => {
  
  const images = [
    "/images/1.png", 
    "/images/2.png", 
    "/images/3.png", 
    "/images/4.png",
    "/images/5.png" 
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length]);

  // Manual navigation
  const goToSlide = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="home-container">
      {/* Hero section with carousel */}
      <div className="hero-section">
        <div className="carousel">
          {images.map((image, index) => (
            <div 
              key={index} 
              className={`carousel-slide ${index === currentImageIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${image})` }}
            >
              <div className="carousel-content">
                <h1>FeedingHands</h1>
                <p>Turn Your Extra Food into Someone's Next Meal</p>
                <div className="cta-buttons">
                  <Link to="/signup" className="btn btn-primary">Join Now</Link>
                  <Link to="/login" className="btn btn-secondary">Sign In</Link>
                </div>
              </div>
            </div>
          ))}
          
         
          <div className="carousel-indicators">
            {images.map((_, index) => (
              <button 
                key={index} 
                className={index === currentImageIndex ? "active" : ""} 
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content section */}
      <div className="main-content">
        <div className="welcome-section">
          <h2>👐 Welcome to FeedingHands</h2>
          <p>
            Turn Your Extra Food into Someone's Next Meal. FeedingHands connects kind-hearted 
            individuals like you with nearby NGOs that need food. Whether it's leftovers from a 
            celebration or surplus from your kitchen, your donation can make a real difference.
          </p>
        </div>

        <div className="how-it-works">
          <h2>✨ How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-icon">1</div>
              <h3>Share Details</h3>
              <p>Let us know what food you want to donate.</p>
            </div>
            <div className="step">
              <div className="step-icon">2</div>
              <h3>Pick a Time & Location</h3>
              <p>Schedule the pickup or drop-off.</p>
            </div>
            <div className="step">
              <div className="step-icon">3</div>
              <h3>We Handle the Rest</h3>
              <p>Nearby NGOs are notified instantly to collect the food.</p>
            </div>
          </div>
        </div>

        <div className="why-donate">
          <h2>💡 Why Donate?</h2>
          <div className="reasons">
            <div className="reason">
              <h3>Reduce food waste</h3>
              <p>Help the environment by preventing perfectly good food from going to waste.</p>
            </div>
            <div className="reason">
              <h3>Feed those in need</h3>
              <p>Your donation directly benefits people who need nutritious meals.</p>
            </div>
            <div className="reason">
              <h3>Make your community stronger</h3>
              <p>Build connections and create a more supportive local community.</p>
            </div>
          </div>
        </div>

        <div className="mission-statement">
          <p>
            Join our mission of sharing, caring, and uplifting lives—one meal at a time. 
            Every meal you donate is a gesture of hope.
          </p>
          <Link to="/signup" className="btn btn-large">Start Donating Today</Link>
        </div>
      </div>

      <footer className="home-footer">
        <p>© 2025 FeedingHands. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;