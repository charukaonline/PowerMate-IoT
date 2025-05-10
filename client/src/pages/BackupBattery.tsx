// src/components/BatteryHistoryDashboard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Battery, Activity, Percent, Clock, Download, RefreshCw, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Entry {
  _id: string;
  deviceId: string;
  voltage: number;
  current: number;
  percentage: number;
  timestamp: string;
}

interface BatteryHistoryDashboardProps {
  deviceId?: string;
}

const BatteryHistoryDashboard: React.FC<BatteryHistoryDashboardProps> = ({
                                                                           deviceId = '88:13:BF:0C:3B:6C'
                                                                         }) => {
  const [data, setData] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'6h' | '24h' | '7d' | '30d'>('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const API_URL = `http://localhost:5000/api/battery-history/${deviceId}`;

  // Initialize dark mode based on browser preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);

    // Add listener for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Fetch data function
  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get<Entry[]>(`${API_URL}?range=${timeRange}`);
      setData(response.data);
      setError('');
    } catch (err) {
      setError('Unable to load battery history data. Please try again later.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // Sort data by timestamp
  const sorted = [...data].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Get the latest entry
  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : {
    voltage: 0, current: 0, percentage: 0, timestamp: ''
  };

  // Format for charts
  const chartData = sorted.map(e => ({
    time: new Date(e.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
    voltage: +e.voltage.toFixed(2),
    current: +e.current.toFixed(2),
    percentage: e.percentage
  }));

  // Get battery status
  const getBatteryStatus = (percentage: number) => {
    if (percentage >= 80) return 'Healthy';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    if (percentage >= 20) return 'Low';
    return 'Critical';
  };

  // Get status color
  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return darkMode ? 'text-green-400' : 'text-green-600';
    if (percentage >= 60) return darkMode ? 'text-emerald-400' : 'text-emerald-500';
    if (percentage >= 40) return darkMode ? 'text-yellow-400' : 'text-yellow-500';
    if (percentage >= 20) return darkMode ? 'text-orange-400' : 'text-orange-500';
    return darkMode ? 'text-red-400' : 'text-red-600';
  };

  // Handle time range change
  const handleTimeRangeChange = (range: '6h' | '24h' | '7d' | '30d') => {
    setTimeRange(range);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Format date for display
  const formatDate = (timestamp: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Export data as CSV
  const exportData = () => {
    const headers = ['Time', 'Voltage (V)', 'Current (A)', 'Percentage (%)'];
    const csvData = sorted.map(entry => [
      formatDate(entry.timestamp),
      entry.voltage.toFixed(2),
      entry.current.toFixed(2),
      entry.percentage
    ].join(',')).join('\n');

    const blob = new Blob([`${headers.join(',')}\n${csvData}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `battery-history-${deviceId}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.3
      }
    }
  };

  if (loading) {
    return (
        <div className={`p-6 space-y-6 min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <div className={`h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse rounded w-1/3`}></div>
            <div className={`h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse rounded w-1/4`}></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className={`h-24 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse rounded`}></div>
            ))}
          </div>
          <div className={`h-64 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse rounded`}></div>
          <div className={`h-64 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse rounded`}></div>
          <div className={`h-64 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse rounded`}></div>
        </div>
    );
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
      <div className={`p-4 md:p-6 space-y-6 min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`  } style={{borderRadius: '1rem'}}>
        {/* Header */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold flex items-center ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              <Battery className="mr-2" size={28} /> Battery Dashboard
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Device: {deviceId}</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <div className={`flex space-x-1 rounded-lg shadow p-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              {(['6h', '24h', '7d', '30d'] as const).map((range) => (
                  <motion.button
                      key={range}
                      onClick={() => handleTimeRangeChange(range)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1 text-sm rounded-md transition ${
                          timeRange === range
                              ? darkMode
                                  ? 'bg-blue-900 text-blue-300 font-medium'
                                  : 'bg-blue-100 text-blue-700 font-medium'
                              : darkMode
                                  ? 'hover:bg-gray-700'
                                  : 'hover:bg-gray-100'
                      }`}
                  >
                    {range}
                  </motion.button>
              ))}
            </div>

            <motion.button
                onClick={handleRefresh}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center px-3 py-1 rounded-lg shadow transition ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                }`}
                disabled={isRefreshing}
            >
              <RefreshCw size={16} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>

            <motion.button
                onClick={exportData}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center px-3 py-1 rounded-lg shadow transition ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                }`}
            >
              <Download size={16} className="mr-1" />
              Export
            </motion.button>

            <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center px-3 py-1 rounded-lg shadow transition ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                }`}
            >
              {darkMode ? <Sun size={16} className="mr-1" /> : <Moon size={16} className="mr-1" />}
              {darkMode ? 'Light' : 'Dark'}
            </motion.button>
          </div>
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
              <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`border-l-4 border-red-500 p-4 rounded ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        {/* Current Stats Cards */}
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div
              variants={itemVariants}
              className={`shadow rounded-lg p-5 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <Battery className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="ml-5">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Voltage</p>
                <div className="flex items-baseline">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{latest.voltage.toFixed(2)}</p>
                  <p className={`ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>V</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
              variants={itemVariants}
              className={`shadow rounded-lg p-5 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                <Activity className={`h-5 w-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div className="ml-5">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current</p>
                <div className="flex items-baseline">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{latest.current.toFixed(2)}</p>
                  <p className={`ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>A</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
              variants={itemVariants}
              className={`shadow rounded-lg p-5 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                <Percent className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className="ml-5">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Capacity</p>
                <div className="flex items-baseline">
                  <p className={`text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{latest.percentage}</p>
                  <p className={`ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>%</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
              variants={itemVariants}
              className={`shadow rounded-lg p-5 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${
                  darkMode
                      ? latest.percentage >= 60 ? 'bg-green-900/30' : latest.percentage >= 20 ? 'bg-yellow-900/30' : 'bg-red-900/30'
                      : latest.percentage >= 60 ? 'bg-green-50' : latest.percentage >= 20 ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <Clock className={`h-5 w-5 ${getStatusColor(latest.percentage)}`} />
              </div>
              <div className="ml-5">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                <div className="flex items-baseline">
                  <p className={`text-2xl font-bold ${getStatusColor(latest.percentage)}`}>
                    {getBatteryStatus(latest.percentage)}
                  </p>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatDate(latest.timestamp)}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Unified Chart */}
        <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            className={`shadow rounded-lg p-4 md:p-6 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <h2 className={`text-lg font-medium mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Battery Performance Overview</h2>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2d3748' : '#f0f0f0'} />
                <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12, fill: darkMode ? '#cbd5e0' : '#4a5568' }}
                    tickLine={false}
                    axisLine={{ stroke: darkMode ? '#4a5568' : '#e5e7eb' }}
                />
                <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: darkMode ? '#cbd5e0' : '#4a5568' }}
                    tickLine={false}
                    axisLine={{ stroke: darkMode ? '#4a5568' : '#e5e7eb' }}
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: darkMode ? '#cbd5e0' : '#4a5568' }}
                    tickLine={false}
                    axisLine={{ stroke: darkMode ? '#4a5568' : '#e5e7eb' }}
                    domain={[0, 100]}
                />
                <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? 'rgba(26, 32, 44, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '6px',
                      borderColor: darkMode ? '#4a5568' : '#e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      color: darkMode ? '#e2e8f0' : 'inherit'
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ paddingTop: '10px' }}
                />
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="voltage"
                    name="Voltage (V)"
                    stroke={darkMode ? '#3b82f6' : '#0284c7'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                />
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="current"
                    name="Current (A)"
                    stroke={darkMode ? '#d946ef' : '#c026d3'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                />
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="percentage"
                    name="Capacity (%)"
                    stroke={darkMode ? '#10b981' : '#16a34a'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Individual Charts */}
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {[
            { key: 'voltage', label: 'Voltage (V)', color: darkMode ? '#3b82f6' : '#0284c7', bgColor: darkMode ? 'bg-blue-900/30' : 'bg-blue-50' },
            { key: 'current', label: 'Current (A)', color: darkMode ? '#d946ef' : '#c026d3', bgColor: darkMode ? 'bg-purple-900/30' : 'bg-purple-50' },
            { key: 'percentage', label: 'Capacity (%)', color: darkMode ? '#10b981' : '#16a34a', bgColor: darkMode ? 'bg-green-900/30' : 'bg-green-50' }
          ].map(({ key, label, color, bgColor }) => (
              <motion.div
                  key={key}
                  variants={itemVariants}
                  className={`shadow rounded-lg p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
              >
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-md ${bgColor}`}>
                    <div className="h-3 w-3" style={{ backgroundColor: color }}></div>
                  </div>
                  <h2 className={`text-base font-medium ml-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{label}</h2>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke={darkMode ? '#4a5568' : undefined} />
                      <XAxis
                          dataKey="time"
                          tick={{ fontSize: 11, fill: darkMode ? '#cbd5e0' : '#4a5568' }}
                          tickLine={false}
                          minTickGap={20}
                          axisLine={{ stroke: darkMode ? '#4a5568' : '#e5e7eb' }}
                      />
                      <YAxis
                          tick={{ fontSize: 11, fill: darkMode ? '#cbd5e0' : '#4a5568' }}
                          tickLine={false}
                          axisLine={{ stroke: darkMode ? '#4a5568' : '#e5e7eb' }}
                          domain={key === 'percentage' ? [0, 100] : ['dataMin - 0.5', 'dataMax + 0.5']}
                      />
                      <Tooltip
                          contentStyle={{
                            backgroundColor: darkMode ? 'rgba(26, 32, 44, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '4px',
                            padding: '8px',
                            fontSize: '12px',
                            color: darkMode ? '#e2e8f0' : 'inherit'
                          }}
                          formatter={(value: number) => [`${value}${key === 'percentage' ? '%' : key === 'voltage' ? 'V' : 'A'}`, '']}
                      />
                      <Line
                          type="monotone"
                          dataKey={key}
                          stroke={color}
                          dot={false}
                          strokeWidth={2}
                          activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
          ))}
        </motion.div>

        {/* Data Table */}
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className={`shadow rounded-lg overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <div className={`p-4 flex justify-between items-center border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>History Data</h2>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{sorted.length} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
              <tr>
                {['Time', 'Voltage (V)', 'Current (A)', 'Capacity (%)', 'Timestamp'].map(header => (
                    <th
                        key={header}
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                    >
                      {header}
                    </th>
                ))}
              </tr>
              </thead>
              <tbody
                  className={`${darkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}`}>
              <AnimatePresence>
                {sorted.slice(Math.max(sorted.length - 15, 0)).reverse().map((entry, index) => (
                    <motion.tr
                        key={entry._id}
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -10}}
                        transition={{delay: index * 0.05}}
                        className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                    >
                      <td className={`px-6 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {new Date(entry.timestamp).toLocaleTimeString([], {
                          hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
                        })}
                      </td>
                      <td className={`px-6 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {entry.voltage.toFixed(2)}
                      </td>
                      <td className={`px-6 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                        {entry.current.toFixed(2)}
                      </td>
                      <td className={`px-6 py-3 whitespace-nowrap text-sm`}>
                        <div className="flex items-center">
                          <div className={`w-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5 mr-2`}>
                            <motion.div
                                initial={{width: 0}}
                                animate={{width: `${entry.percentage}%`}}
                                transition={{duration: 1, ease: "easeOut"}}
                                className={`h-2.5 rounded-full ${
                                    entry.percentage >= 80 ? darkMode ? 'bg-green-400' : 'bg-green-500' :
                                        entry.percentage >= 60 ? darkMode ? 'bg-emerald-400' : 'bg-emerald-500' :
                                            entry.percentage >= 40 ? darkMode ? 'bg-yellow-400' : 'bg-yellow-500' :
                                                entry.percentage >= 20 ? darkMode ? 'bg-orange-400' : 'bg-orange-500' :
                                                    darkMode ? 'bg-red-400' : 'bg-red-500'
                                }`}
                            ></motion.div>
                          </div>
                          <span className={`${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{entry.percentage}%</span>
                        </div>
                      </td>
                      <td className={`px-6 py-3 whitespace-nowrap text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {entry.timestamp}
                      </td>
                    </motion.tr>
                ))}
              </AnimatePresence>
              </tbody>
            </table>
            {sorted.length > 15 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className={`px-6 py-3 border-t text-center ${darkMode ? 'border-gray-700' : 'border-t'}`}
                >
                  <motion.button
                      whileHover={{scale: 1.05}}
                      whileTap={{scale: 0.95}}
                      onClick={() => window.location.href = "/full-battery-history"}
                      className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} text-sm font-medium`}
                  >
                    Show all {sorted.length} entries
                  </motion.button>
                </motion.div>
            )}
          </div>
        </motion.div>
      </div>
  );
};

export default BatteryHistoryDashboard;