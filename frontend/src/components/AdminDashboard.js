import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const fetchUsers = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again later.');
      setLoading(false);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('You are not authorized to access the admin panel.');
        logout();
      }
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchUsers();
  }, [navigate, user, logout]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        fetchUsers(); // Refresh the list
      } catch (error) {
        setError('Failed to delete user');
        if (error.response?.status === 401) {
          logout();
        }
      }
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/status`, 
        { status: isActive ? 'suspended' : 'active' },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchUsers(); // Refresh the list
    } catch (error) {
      setError('Failed to update user status');
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const filteredUsers = selectedRole === 'all' 
    ? users 
    : users.filter(user => user.role === selectedRole);

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h2>Admin Dashboard</h2>
        <div className="header-actions">
          <select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">All Users</option>
            <option value="donor">Donors</option>
            <option value="ngo">NGOs</option>
            <option value="admin">Admins</option>
          </select>
          <button className="refresh-button" onClick={fetchUsers}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.profile?.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.active ? 'active' : 'suspended'}`}>
                      {user.active ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className={`status-toggle-button ${user.active ? 'suspend' : 'activate'}`}
                        onClick={() => handleToggleStatus(user._id, user.active)}
                      >
                        {user.active ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 