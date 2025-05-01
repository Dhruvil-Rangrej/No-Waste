import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DonorDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);  // Track loading state
  const [error, setError] = useState(null);  // Track error state
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  
  const fetchEvents = async () => {
    setLoading(true);
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Fetch donor events using the token from auth context
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/events/mine`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching donor events:', error);
      setError('Failed to fetch events. Please try again later.');
      setLoading(false);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Run fetchEvents after component mounts
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'donor') {
      navigate('/login');
      return;
    }

    fetchEvents();
  }, [navigate, user, logout]);

  // Format date for better readability
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Donor Dashboard</h2>
        <div className="header-actions">
          <Link to="/donor/create-event" className="create-event-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Event
          </Link>
          <button className="refresh-button" onClick={fetchEvents}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Refresh Events
          </button>
        </div>
      </div>

      <h3 className="section-title">
        Your Donation Events
        {events.length > 0 && <span>{events.length}</span>}
      </h3>
      
      {events.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any donation events yet.</p>
          <Link to="/donor/create-event" className="create-first-button">
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="events-list">
          {events.map((event) => (
            <div 
              key={event._id} 
              className={`event-card ${event.status === 'accepted' ? 'event-card-accepted' : 'event-card-pending'}`}
            >
              <div className="event-header">
                <h4 className="event-title">{event.name}</h4>
                <div className="event-date">{formatDate(event.date)}</div>
              </div>
              <div className="event-body">
                <div className="event-detail">
                  <div className="detail-label">Location:</div>
                  <div className="detail-value">{event.location?.address}</div>
                </div>
                <div className="event-detail">
                  <div className="detail-label">Quantity:</div>
                  <div className="detail-value">{event.foodDetails?.quantity} kg</div>
                </div>
                <div className="event-detail">
                  <div className="detail-label">Food Type:</div>
                  <div className="detail-value">{event.foodDetails?.type}</div>
                </div>
                {event.foodDetails?.description && (
                  <div className="event-detail">
                    <div className="detail-label">Description:</div>
                    <div className="detail-value">{event.foodDetails.description}</div>
                  </div>
                )}
                
                {event.ngo ? (
                  <div className="status-indicator status-accepted">
                    Accepted by: {event.ngo.profile?.name} ({event.ngo.email})
                  </div>
                ) : (
                  <div className="status-indicator status-pending">
                    Waiting for NGO acceptance
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
