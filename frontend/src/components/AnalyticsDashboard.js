import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalFoodSaved: 0,
    totalPeopleFed: 0,
    impactScore: 0
  });
  const [monthlyDonations, setMonthlyDonations] = useState([]);
  const [foodTypeDistribution, setFoodTypeDistribution] = useState([]);
  const { user } = useAuth();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setStats(response.data.stats);
      setMonthlyDonations(response.data.monthlyDonations);
      setFoodTypeDistribution(response.data.foodTypeDistribution);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch analytics data');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="analytics-dashboard">
      <h2>Impact Analytics</h2>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Donations</h3>
          <div className="stat-value">{stats.totalDonations}</div>
        </div>
        <div className="stat-card">
          <h3>Food Saved (kg)</h3>
          <div className="stat-value">{stats.totalFoodSaved}</div>
        </div>
        <div className="stat-card">
          <h3>People Fed</h3>
          <div className="stat-value">{stats.totalPeopleFed}</div>
        </div>
        <div className="stat-card">
          <h3>Impact Score</h3>
          <div className="stat-value">{stats.impactScore}</div>
        </div>
      </div>

      {/* Monthly Donations Chart */}
      <div className="chart-container">
        <h3>Monthly Donations</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyDonations}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="donations" fill="#0088FE" name="Number of Donations" />
            <Bar dataKey="quantity" fill="#00C49F" name="Quantity (kg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Food Type Distribution */}
      <div className="chart-container">
        <h3>Food Type Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={foodTypeDistribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {foodTypeDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 