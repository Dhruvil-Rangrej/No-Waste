import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NgoDashboard = () => {
  const [availableEvents, setAvailableEvents] = useState([]);
  const [acceptedEvents, setAcceptedEvents] = useState([]);
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('');
  const [loading, setLoading] = useState({
    available: true,
    accepted: true
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchAvailableEvents = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      let url = 'http://localhost:5000/api/events';
      const params = new URLSearchParams();
      
      if (filterLocation) params.append('location', filterLocation);
      if (filterType) params.append('type', filterType);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setAvailableEvents(response.data);
      setLoading(prev => ({ ...prev, available: false }));
    } catch (error) {
      console.error('Error fetching available events:', error);
      setError('Failed to fetch available events. Please try again later.');
      setLoading(prev => ({ ...prev, available: false }));
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const fetchAcceptedEvents = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/events/accepted', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setAcceptedEvents(response.data);
      setLoading(prev => ({ ...prev, accepted: false }));
    } catch (error) {
      console.error('Error fetching accepted events:', error);
      setError('Failed to fetch accepted events. Please try again later.');
      setLoading(prev => ({ ...prev, accepted: false }));
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const refreshEvents = () => {
    setLoading({ available: true, accepted: true });
    fetchAvailableEvents();
    fetchAcceptedEvents();
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'ngo') {
      navigate('/login');
      return;
    }

    refreshEvents();
  }, [navigate, user, logout]);

  const handleAccept = async (eventId) => {
    try {
      await axios.post(`http://localhost:5000/api/events/${eventId}/accept`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      refreshEvents();
    } catch (error) {
      console.error('Error accepting event:', error);
      setError('Failed to accept event. Please try again.');
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

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

  if (loading.available && loading.accepted) {
    return <div className="loading">Loading events...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>NGO Dashboard</h2>
        <button className="refresh-button" onClick={refreshEvents}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Refresh
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Location</label>
          <input
            type="text"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            placeholder="Filter by location"
          />
        </div>
        <div className="filter-group">
          <label>Food Type</label>
          <input
            type="text"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            placeholder="Filter by food type"
          />
        </div>
        <button className="apply-filters-button" onClick={fetchAvailableEvents}>
          Apply Filters
        </button>
      </div>

      <h3 className="section-title">
        Available Donation Events
        {availableEvents.length > 0 && <span>{availableEvents.length}</span>}
      </h3>
      
      {availableEvents.length === 0 ? (
        <div className="empty-state">
          <p>No available events found matching your criteria.</p>
        </div>
      ) : (
        <div className="events-list">
          {availableEvents.map((event) => (
            <div key={event._id} className="event-card event-card-available">
              <div className="event-header">
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
                <div className="donor-info">
                  <div>Donor: <span className="donor-name">{event.donor?.profile?.name}</span></div>
                  <div>{event.donor?.email}</div>
                </div>
              </div>
              <div className="event-actions">
                <button 
                  className="accept-button"
                  onClick={() => handleAccept(event._id)}
                >
                  Accept Donation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className="section-title">
        Your Accepted Events
        {acceptedEvents.length > 0 && <span>{acceptedEvents.length}</span>}
      </h3>
      
      {acceptedEvents.length === 0 ? (
        <div className="empty-state">
          <p>You have not accepted any events yet.</p>
        </div>
      ) : (
        <div className="events-list">
          {acceptedEvents.map((event) => (
            <div key={event._id} className="event-card event-card-accepted">
              <div className="event-header">
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
                <div className="donor-info">
                  <div>Donor: <span className="donor-name">{event.donor?.profile?.name}</span></div>
                  <div>{event.donor?.email}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NgoDashboard;