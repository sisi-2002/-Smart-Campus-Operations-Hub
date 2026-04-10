import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import bookingApi from '../../api/bookingApi';
import resourceApi from '../../api/resourceApi';

const BookingAnalytics = () => {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [selectedResource, setSelectedResource] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings using the existing bookingApi
      const bookingsResponse = await bookingApi.getAllBookings();
      console.log('Bookings response:', bookingsResponse.data);
      setBookings(bookingsResponse.data || []);
      
      // Fetch resources - handle potential error
      try {
        const resourcesResponse = await resourceApi.getAllResources();
        console.log('Resources response:', resourcesResponse.data);
        setResources(resourcesResponse.data || []);
      } catch (resourceErr) {
        console.warn('Could not fetch resources:', resourceErr);
        setResources([]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings by time range
  const getFilteredBookings = () => {
    const now = new Date();
    const filtered = bookings.filter(booking => {
      const bookingDate = new Date(booking.startTime);
      if (timeRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return bookingDate >= weekAgo;
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return bookingDate >= monthAgo;
      } else if (timeRange === 'year') {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return bookingDate >= yearAgo;
      }
      return true;
    });
    
    if (selectedResource !== 'all') {
      return filtered.filter(b => b.resourceId === selectedResource);
    }
    return filtered;
  };

  const filteredBookings = getFilteredBookings();
  
  // Statistics Calculations
  const totalBookings = filteredBookings.length;
  const approvedBookings = filteredBookings.filter(b => b.status === 'APPROVED').length;
  const pendingBookings = filteredBookings.filter(b => b.status === 'PENDING').length;
  const rejectedBookings = filteredBookings.filter(b => b.status === 'REJECTED').length;
  const cancelledBookings = filteredBookings.filter(b => b.status === 'CANCELLED').length;
  
  const approvalRate = totalBookings > 0 ? ((approvedBookings / totalBookings) * 100).toFixed(1) : 0;

  // Bookings by month (last 6 months)
  const getLast6Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString('default', { month: 'short', year: 'numeric' }));
    }
    return months;
  };

  const monthlyData = getLast6Months().map(month => {
    const monthBookings = filteredBookings.filter(b => {
      const date = new Date(b.startTime);
      return date.toLocaleString('default', { month: 'short', year: 'numeric' }) === month;
    });
    return {
      month,
      total: monthBookings.length,
      approved: monthBookings.filter(b => b.status === 'APPROVED').length,
      pending: monthBookings.filter(b => b.status === 'PENDING').length,
    };
  });

  // Bookings by resource type
  const bookingsByType = {};
  filteredBookings.forEach(booking => {
    const type = booking.resourceType || 'Other';
    bookingsByType[type] = (bookingsByType[type] || 0) + 1;
  });
  const typeData = Object.entries(bookingsByType).map(([name, value]) => ({ name, value }));

  // Most popular resources
  const resourceCount = {};
  filteredBookings.forEach(booking => {
    if (booking.status === 'APPROVED') {
      const name = booking.resourceName || 'Unknown';
      resourceCount[name] = (resourceCount[name] || 0) + 1;
    }
  });
  const topResources = Object.entries(resourceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Peak hours analysis
  const hourDistribution = {};
  for (let i = 0; i < 24; i++) hourDistribution[i] = 0;
  
  filteredBookings.forEach(booking => {
    const hour = new Date(booking.startTime).getHours();
    hourDistribution[hour]++;
  });
  
  const peakHoursData = Object.entries(hourDistribution).map(([hour, count]) => ({
    hour: `${hour}:00`,
    count,
  }));

  // Day of week distribution
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayDistribution = daysOfWeek.map(day => ({ day, count: 0 }));
  
  filteredBookings.forEach(booking => {
    const day = new Date(booking.startTime).getDay();
    dayDistribution[day].count++;
  });

  // Status distribution for pie chart
  const statusData = [
    { name: 'Approved', value: approvedBookings, color: '#10b981' },
    { name: 'Pending', value: pendingBookings, color: '#f59e0b' },
    { name: 'Rejected', value: rejectedBookings, color: '#ef4444' },
    { name: 'Cancelled', value: cancelledBookings, color: '#6b7280' },
  ].filter(s => s.value > 0);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#6366f1', '#8b5cf6'];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIcon}>📊</div>
        <h3>No Booking Data Available</h3>
        <p>Create some bookings first to see analytics</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with Filters */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Booking Analytics Dashboard</h1>
          <p style={styles.subtitle}>Comprehensive insights and statistics</p>
        </div>
        <div style={styles.filters}>
          <select 
            style={styles.filterSelect}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          {resources.length > 0 && (
            <select 
              style={styles.filterSelect}
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
            >
              <option value="all">All Resources</option>
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>📊</div>
          <div style={styles.kpiValue}>{totalBookings}</div>
          <div style={styles.kpiLabel}>Total Bookings</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>✅</div>
          <div style={styles.kpiValue}>{approvedBookings}</div>
          <div style={styles.kpiLabel}>Approved</div>
          <div style={{ ...styles.kpiTrend, color: '#10b981' }}>{approvalRate}% approval rate</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>⏳</div>
          <div style={styles.kpiValue}>{pendingBookings}</div>
          <div style={styles.kpiLabel}>Pending</div>
        </div>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIcon}>📈</div>
          <div style={styles.kpiValue}>{rejectedBookings + cancelledBookings}</div>
          <div style={styles.kpiLabel}>Unsuccessful</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        {/* Monthly Trends Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📈 Monthly Booking Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} name="Total Bookings" />
              <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} name="Approved" />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Type Distribution */}
        {typeData.length > 0 && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>🏢 Bookings by Resource Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Resources Bar Chart */}
        {topResources.length > 0 && (
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>⭐ Most Popular Resources</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topResources} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis type="category" dataKey="name" stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status Distribution */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>🎯 Booking Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours Analysis */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>⏰ Peak Hours Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f133" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Day of Week Distribution */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>📅 Busiest Days</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                {dayDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.day === 'Friday' ? '#f59e0b' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Insights */}
      <div style={styles.insightsCard}>
        <h3 style={styles.insightsTitle}>📊 Key Insights</h3>
        <div style={styles.insightsGrid}>
          <div style={styles.insightItem}>
            <span style={styles.insightIcon}>🎯</span>
            <div>
              <strong>Approval Rate</strong>
              <p>{approvalRate}% of bookings are approved</p>
            </div>
          </div>
          <div style={styles.insightItem}>
            <span style={styles.insightIcon}>⏱️</span>
            <div>
              <strong>Peak Time</strong>
              <p>{peakHoursData.reduce((max, curr) => curr.count > max.count ? curr : max, { hour: '', count: 0 }).hour}</p>
            </div>
          </div>
          <div style={styles.insightItem}>
            <span style={styles.insightIcon}>🏆</span>
            <div>
              <strong>Most Popular</strong>
              <p>{topResources[0]?.name || 'N/A'} ({topResources[0]?.count || 0} bookings)</p>
            </div>
          </div>
          <div style={styles.insightItem}>
            <span style={styles.insightIcon}>📈</span>
            <div>
              <strong>Trend</strong>
              <p>{monthlyData[monthlyData.length - 1]?.total > monthlyData[0]?.total ? 'Increasing' : 'Stable'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    background: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: '14px',
    color: '#64748b',
  },
  filters: {
    display: 'flex',
    gap: '12px',
  },
  filterSelect: {
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    background: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  kpiCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  kpiIcon: {
    fontSize: '28px',
    marginBottom: '12px',
  },
  kpiValue: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  kpiLabel: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '4px',
  },
  kpiTrend: {
    fontSize: '12px',
    marginTop: '8px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  chartCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  chartTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  insightsCard: {
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    borderRadius: '16px',
    padding: '24px',
    color: '#fff',
  },
  insightsTitle: {
    margin: '0 0 16px 0',
    fontSize: '18px',
    fontWeight: '600',
  },
  insightsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  insightItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.1)',
    padding: '12px',
    borderRadius: '12px',
  },
  insightIcon: {
    fontSize: '24px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    background: '#f8fafc',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    background: '#f8fafc',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
};

// Add animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default BookingAnalytics;