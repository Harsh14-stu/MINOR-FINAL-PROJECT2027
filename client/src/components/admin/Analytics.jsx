import React, { useState, useEffect } from 'react';
import { 
  FiActivity, FiTrendingUp, FiBarChart2, FiPieChart, 
  FiCalendar, FiFilter 
} from 'react-icons/fi';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { adminService } from '../../services/api';
import { toast } from 'react-toastify';

const Analytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalTrips: 1247,
    successRate: 98.5,
    avgETA: '12min',
    totalRevenue: '₹2.45L'
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [chartData, setChartData] = useState({
    trips: [],
    delays: [],
    passengers: []
  });

  // Date ranges
  const dateRanges = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '365d', label: '1 Year' }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminService.getReports();
      setStats(response.data.reports || stats);
      setChartData({
        trips: generateDemoData(30),
        delays: generateDelayData(30),
        passengers: generatePassengerData(30)
      });
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // Demo chart data generators
  const generateDemoData = (days) => {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      value: Math.floor(Math.random() * 50) + 20
    })).reverse();
  };

  const generateDelayData = (days) => {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      value: Math.floor(Math.random() * 15)
    })).reverse();
  };

  const generatePassengerData = (days) => {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
      value: Math.floor(Math.random() * 200) + 100
    })).reverse();
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }) => (
    <div className="stat-card group">
      <div className={`stat-icon ${color} group-hover:scale-110 transition-transform`}>
        <Icon />
      </div>
      <div className="stat-number">{value}</div>
      <div className="stat-label">{title}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
      {trend !== undefined && (
        <div className={`text-sm mt-2 font-semibold flex items-center gap-1 ${
          trend >= 0 ? 'text-emerald-600' : 'text-red-600'
        }`}>
          {trend >= 0 ? '↗️' : '↘️'} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="loading w-16 h-16"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar onMenuToggle={() => setSidebarOpen(true)} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-purple-900 to-indigo-900 bg-clip-text text-transparent mb-4 leading-tight">
                  Analytics Dashboard
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Comprehensive insights into your bus operations and performance metrics
                </p>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-secondary px-6 py-3">
                  📥 Export CSV
                </button>
                <button className="btn btn-primary px-6 py-3">
                  📊 Full Report
                </button>
              </div>
            </div>

            {/* Date Filter */}
            <div className="card p-6 mb-8">
              <div className="flex flex-wrap items-center gap-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FiCalendar className="w-5 h-5" />
                  Time Period
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dateRanges.map(({ id, label }) => (
                    <button
                      key={id}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        dateRange === id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:shadow-md'
                      }`}
                      onClick={() => setDateRange(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
                  <FiFilter className="w-4 h-4" />
                  Last updated: {new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* KPI Stats */}
          <div className="dashboard-grid mb-12">
            <StatCard
              icon={FiActivity}
              title="Total Trips"
              value={stats.totalTrips.toLocaleString()}
              subtitle="This month"
              trend={18}
              color="bg-gradient-to-r from-emerald-500 to-teal-600"
            />
            <StatCard
              icon={FiTrendingUp}
              title="Success Rate"
              value={`${stats.successRate}%`}
              subtitle="On-time arrivals"
              trend={3}
              color="bg-gradient-to-r from-green-500 to-emerald-600"
            />
            <StatCard
              icon={FiBarChart2}
              title="Avg ETA"
              value={stats.avgETA}
              subtitle="All routes"
              trend={-2}
              color="bg-gradient-to-r from-blue-500 to-indigo-600"
            />
            <StatCard
              icon={FiUsers}
              title="Passengers"
              value={stats.totalPassengers?.toLocaleString() || '12.4K'}
              subtitle="This month"
              trend={25}
              color="bg-gradient-to-r from-purple-500 to-violet-600"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
            {/* Trips Chart */}
            <div className="lg:col-span-2 xl:col-span-1 card p-8">
              <div className="card-header mb-6">
                <h2 className="card-title flex items-center gap-2">
                  <FiActivity className="w-6 h-6" />
                  Daily Trips
                </h2>
                <span className="text-sm bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  +18% vs last month
                </span>
              </div>
              <div className="h-80 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 flex items-center justify-center border-2 border-dashed border-gray-200">
                <div className="text-center text-gray-500">
                  <FiBarChart2 className="w-20 h-20 mx-auto mb-4 opacity-40" />
                  <div className="space-y-1">
                    <p className="font-semibold">Interactive Chart</p>
                    <p className="text-sm">Chart.js / Recharts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delays Chart */}
            <div className="card p-8">
              <div className="card-header mb-6">
                <h2 className="card-title flex items-center gap-2">
                  <FiClock className="w-6 h-6" />
                  Delay Analytics
                </h2>
              </div>
              <div className="h-64 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 flex items-center justify-center border-2 border-dashed border-orange-200">
                <div className="text-center">
                  <div className="w-20 h-20 bg-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FiClock className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="font-semibold text-orange-800 mb-1">Avg Delay: 8min</p>
                  <p className="text-sm text-orange-700">5% of trips delayed</p>
                </div>
              </div>
            </div>

            {/* Route Performance */}
            <div className="card p-8">
              <div className="card-header mb-6">
                <h2 className="card-title flex items-center gap-2">
                  <FiMapPin className="w-6 h-6" />
                  Top Routes
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  { route: 'Route A', trips: 247, success: '98%' },
                  { route: 'Route B', trips: 189, success: '95%' },
                  { route: 'Route C', trips: 156, success: '97%' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <span className="font-medium">{item.route}</span>
                    <div className="text-right">
                      <div className="font-bold text-lg text-blue-600">{item.trips}</div>
                      <div className="text-sm text-emerald-600">{item.success}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Metrics */}
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
            {/* Performance Metrics */}
            <div className="card p-8">
              <div className="card-header mb-8">
                <h2 className="card-title">Key Performance Indicators</h2>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-black text-emerald-600 mb-2">98.7%</div>
                  <div className="text-gray-600">On-Time Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-blue-600 mb-2">42 km/h</div>
                  <div className="text-gray-600">Avg Speed</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-orange-600 mb-2">14 min</div>
                  <div className="text-gray-600">Avg Trip Time</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-purple-600 mb-2">₹245</div>
                  <div className="text-gray-600">Revenue/Trip</div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="card p-8">
              <div className="card-header mb-6">
                <h2 className="card-title flex items-center gap-2">
                  <FiAlertCircle className="w-6 h-6" />
                  Recent Alerts
                </h2>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {[
                  { type: 'delay', bus: 'DL01AB1234', time: '2min ago', severity: 'medium' },
                  { type: 'maintenance', bus: 'DL02CD5678', time: '15min ago', severity: 'low' },
                  { type: 'overcrowded', bus: 'DL03EF9012', time: '1hr ago', severity: 'high' }
                ].map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-l-4 border-orange-400">
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                      alert.severity === 'high' ? 'bg-red-500' : 
                      alert.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {alert.type === 'delay' && '⏰ Delay Alert'}
                        {alert.type === 'maintenance' && '🔧 Maintenance'}
                        {alert.type === 'overcrowded' && '👥 Overcrowded'}
                      </div>
                      <div className="text-sm text-gray-600 truncate">Bus {alert.bus}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-500 text-right whitespace-nowrap">
                      {alert.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;