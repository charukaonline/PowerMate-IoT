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
import { Battery, Activity, Percent, Clock, Download, RefreshCw } from 'lucide-react';

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

  const API_URL = `http://localhost:5000/api/battery-history/${deviceId}`;

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
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-emerald-500';
    if (percentage >= 40) return 'text-yellow-500';
    if (percentage >= 20) return 'text-orange-500';
    return 'text-red-600';
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

  if (loading) {
    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 animate-pulse rounded w-1/4"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
        </div>
    );
  }

  return (
      <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <Battery className="mr-2" size={28} /> Battery Dashboard
            </h1>
            <p className="text-gray-500">Device: {deviceId}</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <div className="flex space-x-1 bg-white rounded-lg shadow p-1">
              {(['6h', '24h', '7d', '30d'] as const).map((range) => (
                  <button
                      key={range}
                      onClick={() => handleTimeRangeChange(range)}
                      className={`px-3 py-1 text-sm rounded-md transition ${
                          timeRange === range
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'hover:bg-gray-100'
                      }`}
                  >
                    {range}
                  </button>
              ))}
            </div>

            <button
                onClick={handleRefresh}
                className="flex items-center px-3 py-1 bg-white rounded-lg shadow hover:bg-gray-50 transition"
                disabled={isRefreshing}
            >
              <RefreshCw size={16} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
                onClick={exportData}
                className="flex items-center px-3 py-1 bg-white rounded-lg shadow hover:bg-gray-50 transition"
            >
              <Download size={16} className="mr-1" />
              Export
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
        )}

        {/* Current Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-blue-50">
                <Battery className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm font-medium">Voltage</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-gray-900">{latest.voltage.toFixed(2)}</p>
                  <p className="ml-1 text-gray-500">V</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-purple-50">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm font-medium">Current</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-gray-900">{latest.current.toFixed(2)}</p>
                  <p className="ml-1 text-gray-500">A</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-green-50">
                <Percent className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm font-medium">Capacity</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-bold text-gray-900">{latest.percentage}</p>
                  <p className="ml-1 text-gray-500">%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 bg-${
                  latest.percentage >= 60 ? 'green' :
                      latest.percentage >= 20 ? 'yellow' : 'red'
              }-50`}>
                <Clock className={`h-5 w-5 ${getStatusColor(latest.percentage)}`} />
              </div>
              <div className="ml-5">
                <p className="text-gray-500 text-sm font-medium">Status</p>
                <div className="flex items-baseline">
                  <p className={`text-2xl font-bold ${getStatusColor(latest.percentage)}`}>
                    {getBatteryStatus(latest.percentage)}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(latest.timestamp)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Chart */}
        <div className="bg-white shadow rounded-lg p-4 md:p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Battery Performance Overview</h2>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                />
                <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    domain={[0, 100]}
                />
                <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '6px',
                      borderColor: '#e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                />
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="current"
                    name="Current (A)"
                    stroke="#c026d3"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                />
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="percentage"
                    name="Capacity (%)"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'voltage', label: 'Voltage (V)', color: '#0284c7', bgColor: 'bg-blue-50' },
            { key: 'current', label: 'Current (A)', color: '#c026d3', bgColor: 'bg-purple-50' },
            { key: 'percentage', label: 'Capacity (%)', color: '#16a34a', bgColor: 'bg-green-50' }
          ].map(({ key, label, color, bgColor }) => (
              <div key={key} className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-md ${bgColor}`}>
                    <div className="h-3 w-3" style={{ backgroundColor: color }}></div>
                  </div>
                  <h2 className="text-base font-medium text-gray-800 ml-2">{label}</h2>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                          dataKey="time"
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          minTickGap={20}
                      />
                      <YAxis
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          domain={key === 'percentage' ? [0, 100] : ['dataMin - 0.5', 'dataMax + 0.5']}
                      />
                      <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '4px',
                            padding: '8px',
                            fontSize: '12px'
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
              </div>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">History Data</h2>
            <span className="text-sm text-gray-500">{sorted.length} entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                {['Time', 'Voltage (V)', 'Current (A)', 'Capacity (%)', 'Timestamp'].map(header => (
                    <th
                        key={header}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                ))}
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {sorted.slice(-15).reverse().map(entry => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {entry.voltage.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                      {entry.current.toFixed(2)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                              className={`h-2.5 rounded-full ${
                                  entry.percentage >= 80 ? 'bg-green-500' :
                                      entry.percentage >= 60 ? 'bg-emerald-500' :
                                          entry.percentage >= 40 ? 'bg-yellow-500' :
                                              entry.percentage >= 20 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${entry.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-900">{entry.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-500">
                      {entry.timestamp}
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
            {sorted.length > 15 && (
                <div className="px-6 py-3 border-t text-center">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Show all {sorted.length} entries
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default BatteryHistoryDashboard;