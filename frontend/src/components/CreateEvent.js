import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateEvent = () => {
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [foodType, setFoodType] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      await axios.post('http://localhost:5000/api/events', {
        date,
        location,
        foodDetails: {
          type: foodType,
          quantity: Number(quantity),
          description
        }
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      navigate('/donor/dashboard');
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      } else {
        setError(error.response?.data.message || 'Error creating event');
      }
    }
  };

  const handleCancel = () => {
    navigate('/donor/dashboard');
  };

  return (
    <div className="create-event-container">
      <div className="create-event-header">
        <h2>Create Donation Event</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="create-event-form" onSubmit={handleCreate}>
        <div className="form-group">
          <label>Date & Time</label>
          <input 
            type="datetime-local" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group full-width">
          <label>Location</label>
          <input 
            type="text" 
            value={location} 
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter pickup location address"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Food Quantity (kg)</label>
          <input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity in kg"
            min="0"
            step="0.1"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Food Type</label>
          <input 
            type="text" 
            value={foodType} 
            onChange={(e) => setFoodType(e.target.value)}
            placeholder="E.g., Cooked meals, Fresh produce"
            required
          />
        </div>
        
        <div className="form-group full-width">
          <label>Description</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide details about the food, dietary information, packaging, etc."
            rows="4"
          />
        </div>
        
        <div className="action-buttons">
          <button type="button" className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" className="create-button">
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;