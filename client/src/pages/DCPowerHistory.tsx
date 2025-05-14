import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import DCDataCards from "@/pages/DCPowerCards.tsx";

interface PowerHistoryEntry {
  _id: string;
  deviceId: string;
  voltage: number;
  current: number;
  timestamp: string;
  __v?: number;
}

interface ApiResponse {
  success: boolean;
  data: PowerHistoryEntry[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

type TimeFilter = "24h" | "7d" | "30d" | "all";

const PowerHistoryChart = () => {
  const [data, setData] = useState<PowerHistoryEntry[]>([]);
  const [filteredData, setFilteredData] = useState<PowerHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Check system dark mode preference
  useEffect(() => {
    // Set initial dark mode from system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setDarkMode(true);
    }

    // Add listener for changes in system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const fetchPowerHistory = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setRefreshing(true);
        const response = await fetch("http://localhost:5000/api/power-history");
        const result: ApiResponse = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setTimeout(() => {
            const sortedData = [...result.data].sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );
            setData(sortedData);
            setLastUpdated(new Date());
            setLoading(false);
            setRefreshing(false);
          }, 600);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        console.error("Error fetching power history:", err);
        setError("Failed to fetch power history. Please try again later.");
        setData([]);
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchPowerHistory();
    intervalId = setInterval(() => fetchPowerHistory(false), 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Apply time filter whenever data or timeFilter changes
  useEffect(() => {
    if (data.length === 0) {
      setFilteredData([]);
      return;
    }

    const now = new Date();
    let filtered;

    switch (timeFilter) {
      case "24h":
        // Last 24 hours
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        filtered = data.filter(
          (entry) => new Date(entry.timestamp) >= oneDayAgo
        );
        break;
      case "7d":
        // Last 7 days
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = data.filter(
          (entry) => new Date(entry.timestamp) >= sevenDaysAgo
        );
        break;
      case "30d":
        // Last 30 days
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        filtered = data.filter(
          (entry) => new Date(entry.timestamp) >= thirtyDaysAgo
        );
        break;
      case "all":
      default:
        filtered = [...data];
        break;
    }

    setFilteredData(filtered);
  }, [data, timeFilter]);

  // Calculate power (P = V * I) for each data point and prepare chart data
  const chartData = useMemo(() => {
    return filteredData.map((entry) => {
      const date = new Date(entry.timestamp);
      const power = entry.voltage * entry.current;

      // Format timestamps based on selected time filter
      let formattedTime;
      if (timeFilter === "24h") {
        formattedTime = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (timeFilter === "7d") {
        formattedTime = `${date.toLocaleDateString([], {
          weekday: "short",
        })} ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else {
        formattedTime = date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        });
      }

      return {
        ...entry,
        power: power.toFixed(2),
        formattedTime,
        formattedDate: date.toLocaleDateString(),
        // Full timestamp for tooltip
        fullTimestamp: date.toLocaleString(),
      };
    });
  }, [filteredData, timeFilter]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    const voltages = chartData.map((d) => d.voltage);
    const currents = chartData.map((d) => d.current);
    const powers = chartData.map((d) => Number(d.power));

    return {
      voltage: {
        avg: (voltages.reduce((a, b) => a + b, 0) / voltages.length).toFixed(2),
        max: Math.max(...voltages).toFixed(2),
        min: Math.min(...voltages).toFixed(2),
      },
      current: {
        avg: (currents.reduce((a, b) => a + b, 0) / currents.length).toFixed(3),
        max: Math.max(...currents).toFixed(3),
        min: Math.min(...currents).toFixed(3),
      },
      power: {
        avg: (powers.reduce((a, b) => a + b, 0) / powers.length).toFixed(2),
        max: Math.max(...powers).toFixed(2),
        min: Math.min(...powers).toFixed(2),
        total: powers.reduce((a, b) => a + b, 0).toFixed(2),
      },
    };
  }, [chartData]);

  // Motion variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  // Dynamic classes based on dark mode
  const mainBgClass = darkMode
    ? "bg-gray-900 text-white"
    : "bg-white text-gray-800";
  const cardBgClass = darkMode ? "bg-gray-800" : "bg-white";
  const chartBgClass = darkMode ? "bg-gray-700" : "bg-gray-50";
  const tableBgClass = darkMode ? "bg-gray-800" : "bg-white";
  const tableHeadClass = darkMode
    ? "bg-gray-700 text-gray-200"
    : "bg-gray-50 text-gray-700";
  const tableRowHoverClass = darkMode
    ? "hover:bg-gray-700"
    : "hover:bg-gray-50";
  const buttonClass = darkMode
    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
    : "bg-blue-500 hover:bg-blue-600 text-white";
  const buttonInactiveClass = darkMode
    ? "bg-gray-600 hover:bg-indigo-700 text-gray-300"
    : "bg-gray-300 hover:bg-blue-600 text-gray-700";
  const loadingBgClass = darkMode ? "bg-gray-700" : "bg-gray-200";
  const errorBgClass = darkMode
    ? "bg-red-900 text-red-200"
    : "bg-red-100 text-red-700";
  const emptyBgClass = darkMode
    ? "bg-yellow-900 text-yellow-200"
    : "bg-yellow-50 text-yellow-700";
  const tagBgClass = darkMode
    ? "bg-gray-700 text-gray-300"
    : "bg-gray-100 text-gray-500";
  const tableTextClass = darkMode ? "text-gray-300" : "text-gray-600";
  const borderClass = darkMode ? "border-gray-700" : "border-gray-200";
  const statCardClass = darkMode ? "bg-gray-700" : "bg-gray-50";

  // Filter button component
  const FilterButton = ({
    value,
    label,
  }: {
    value: TimeFilter;
    label: string;
  }) => (
    <motion.button
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        timeFilter === value ? buttonClass : buttonInactiveClass
      }`}
      onClick={() => setTimeFilter(value)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  );

  return (
    <div
      className={`${mainBgClass} min-h-screen transition-colors duration-300`}
      style={{ borderRadius: "1rem" }}
    >
      <DCDataCards />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          className={`${cardBgClass} shadow-2xl rounded-2xl p-8 border ${borderClass} transition-colors duration-300 relative`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
            <motion.h1
              className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              DC Power History
            </motion.h1>
            <div className="flex items-center gap-4">
              {data.length > 0 && (
                <div className="flex gap-2">
                  <FilterButton value="24h" label="24h" />
                  <FilterButton value="7d" label="7d" />
                  <FilterButton value="30d" label="30d" />
                  <FilterButton value="all" label="All" />
                </div>
              )}
              <motion.button
                className={`p-2 rounded-full border ${borderClass} shadow-md ${
                  refreshing ? "animate-spin" : ""
                } ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                } transition-colors duration-300`}
                onClick={() => {
                  setRefreshing(true);
                  setTimeout(() => setRefreshing(false), 1000);
                  // manual refresh
                  setTimeout(() => {
                    setLastUpdated(new Date());
                  }, 1000);
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                <svg
                  className={`w-6 h-6 ${refreshing ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1 1 19 5.635"
                  />
                </svg>
              </motion.button>
              <motion.button
                className={`p-2 rounded-full ${
                  darkMode ? "bg-gray-700" : "bg-gray-200"
                } transition-colors duration-300`}
                onClick={toggleDarkMode}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                aria-label={
                  darkMode ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                {darkMode ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
          {lastUpdated && (
            <div className="text-xs text-right text-gray-400 mb-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <AnimatePresence mode="wait">
            {loading ? (
              <div
                className={`flex justify-center items-center h-64 ${loadingBgClass} rounded-xl animate-pulse`}
              >
                <svg
                  className="w-12 h-12 animate-spin text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" />
                  <path className="opacity-75" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : error ? (
              <div
                className={`flex justify-center items-center h-64 ${errorBgClass} rounded-xl`}
              >
                {error}
              </div>
            ) : data.length === 0 ? (
              <div
                className={`flex justify-center items-center h-64 ${emptyBgClass} rounded-xl`}
              >
                No data available.
              </div>
            ) : (
              <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key="data"
              >
                {/* Time Filter Controls */}
                <motion.div
                  className="flex flex-wrap justify-center gap-2 sm:gap-4"
                  variants={itemVariants}
                >
                  <FilterButton value="24h" label="Last 24 Hours" />
                  <FilterButton value="7d" label="Last 7 Days" />
                  <FilterButton value="30d" label="Last 30 Days" />
                  <FilterButton value="all" label="All Data" />
                </motion.div>

                {/* Stats Cards */}
                {stats && (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                    variants={itemVariants}
                  >
                    <div className={`${statCardClass} rounded-lg p-4`}>
                      <h4 className="text-sm uppercase font-medium mb-2">
                        Voltage (V)
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-xs text-gray-500">Min</div>
                          <div className="text-lg font-semibold">
                            {stats.voltage.min}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Avg</div>
                          <div className="text-lg font-semibold">
                            {stats.voltage.avg}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Max</div>
                          <div className="text-lg font-semibold">
                            {stats.voltage.max}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`${statCardClass} rounded-lg p-4`}>
                      <h4 className="text-sm uppercase font-medium mb-2">
                        Current (A)
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-xs text-gray-500">Min</div>
                          <div className="text-lg font-semibold">
                            {stats.current.min}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Avg</div>
                          <div className="text-lg font-semibold">
                            {stats.current.avg}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Max</div>
                          <div className="text-lg font-semibold">
                            {stats.current.max}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`${statCardClass} rounded-lg p-4`}>
                      <h4 className="text-sm uppercase font-medium mb-2">
                        Power (W)
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-xs text-gray-500">Min</div>
                          <div className="text-lg font-semibold">
                            {stats.power.min}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Avg</div>
                          <div className="text-lg font-semibold">
                            {stats.power.avg}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="text-lg font-semibold">
                            {stats.power.total}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Chart title with time range display */}
                <motion.div
                  className="text-center mb-2"
                  variants={itemVariants}
                >
                  <h3 className="font-medium">
                    Showing data for:
                    <span className="ml-2 font-bold">
                      {timeFilter === "24h"
                        ? "Last 24 Hours"
                        : timeFilter === "7d"
                        ? "Last 7 Days"
                        : timeFilter === "30d"
                        ? "Last 30 Days"
                        : "All Time"}
                    </span>
                    <span className="ml-2 text-sm">
                      ({filteredData.length} records)
                    </span>
                  </h3>
                </motion.div>

                {filteredData.length === 0 ? (
                  <motion.div
                    className={`${emptyBgClass} p-4 rounded text-center`}
                    variants={itemVariants}
                  >
                    <strong className="block font-medium">
                      No Data Available
                    </strong>
                    <span>
                      No records found for the selected time period. Try a
                      different filter.
                    </span>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      className={`${chartBgClass} p-4 rounded-lg shadow-sm transition-colors duration-300`}
                      variants={itemVariants}
                    >
                      <h3 className="text-lg font-medium mb-3">
                        Voltage and Current Over Time
                      </h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={darkMode ? "#374151" : "#e5e7eb"}
                          />
                          <XAxis
                            dataKey="formattedTime"
                            label={{
                              value: "Time",
                              position: "insideBottomRight",
                              offset: -10,
                            }}
                            stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                            tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }}
                            angle={timeFilter !== "24h" ? -45 : 0}
                            height={60}
                            textAnchor="end"
                          />
                          <YAxis
                            yAxisId="left"
                            domain={["dataMin - 0.1", "dataMax + 0.1"]}
                            label={{
                              value: "Voltage (V)",
                              angle: -90,
                              position: "insideLeft",
                            }}
                            stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                            tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            domain={["dataMin - 0.05", "dataMax + 0.05"]}
                            label={{
                              value: "Current (A)",
                              angle: -90,
                              position: "insideRight",
                            }}
                            stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                            tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }}
                          />
                          <Tooltip
                            formatter={(value, name) => {
                              if (name === "Voltage (V)")
                                return [`${Number(value).toFixed(2)} V`, name];
                              if (name === "Current (A)")
                                return [`${Number(value).toFixed(3)} A`, name];
                              return [value, name];
                            }}
                            labelFormatter={(_, data) => {
                              if (data && data.length > 0) {
                                return `${data[0].payload.fullTimestamp}`;
                              }
                              return "";
                            }}
                            contentStyle={{
                              backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                              border: darkMode
                                ? "1px solid #374151"
                                : "1px solid #E5E7EB",
                              color: darkMode ? "#F9FAFB" : "#1F2937",
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              color: darkMode ? "#D1D5DB" : "#4B5563",
                            }}
                          />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="voltage"
                            stroke="#4F46E5"
                            strokeWidth={2}
                            name="Voltage (V)"
                            dot={timeFilter === "all" ? false : { r: 3 }}
                            activeDot={{ r: 5, strokeWidth: 2 }}
                            isAnimationActive={true}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="current"
                            stroke="#10B981"
                            strokeWidth={2}
                            name="Current (A)"
                            dot={timeFilter === "all" ? false : { r: 3 }}
                            activeDot={{ r: 5, strokeWidth: 2 }}
                            isAnimationActive={true}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                            animationBegin={300}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>

                    <motion.div
                      className={`${chartBgClass} p-4 rounded-lg shadow-sm mt-6 transition-colors duration-300`}
                      variants={itemVariants}
                    >
                      <h3 className="text-lg font-medium mb-3">
                        Power Consumption Over Time
                      </h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={darkMode ? "#374151" : "#e5e7eb"}
                          />
                          <XAxis
                            dataKey="formattedTime"
                            label={{
                              value: "Time",
                              position: "insideBottomRight",
                              offset: -10,
                            }}
                            stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                            tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }}
                            angle={timeFilter !== "24h" ? -45 : 0}
                            height={60}
                            textAnchor="end"
                          />
                          <YAxis
                            domain={["dataMin - 0.2", "dataMax + 0.2"]}
                            label={{
                              value: "Power (W)",
                              angle: -90,
                              position: "insideLeft",
                            }}
                            stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                            tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }}
                          />
                          <Tooltip
                            formatter={(value, name) => [
                              `${Number(value).toFixed(2)} W`,
                              name,
                            ]}
                            labelFormatter={(_, data) => {
                              if (data && data.length > 0) {
                                return `${data[0].payload.fullTimestamp}`;
                              }
                              return "";
                            }}
                            contentStyle={{
                              backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                              border: darkMode
                                ? "1px solid #374151"
                                : "1px solid #E5E7EB",
                              color: darkMode ? "#F9FAFB" : "#1F2937",
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              color: darkMode ? "#D1D5DB" : "#4B5563",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="power"
                            stroke="#F59E0B"
                            strokeWidth={2}
                            name="Power (W)"
                            dot={timeFilter === "all" ? false : { r: 3 }}
                            activeDot={{ r: 5, strokeWidth: 2 }}
                            isAnimationActive={true}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </>
                )}

                <motion.div
                  className={`${tableBgClass} rounded-lg shadow mt-6 transition-colors duration-300`}
                  variants={itemVariants}
                >
                  <div
                    className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b ${borderClass}`}
                  >
                    <h3 className="text-lg font-medium">Raw Data Records</h3>
                    <div
                      className={`${tagBgClass} px-3 py-1 rounded-full text-sm mt-1 sm:mt-0`}
                    >
                      Showing {filteredData.length} of {data.length} records
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className={tableHeadClass}>
                        <tr>
                          <th className="px-4 py-3 font-medium">Device ID</th>
                          <th className="px-4 py-3 font-medium">Voltage (V)</th>
                          <th className="px-4 py-3 font-medium">Current (A)</th>
                          <th className="px-4 py-3 font-medium">Power (W)</th>
                          <th className="px-4 py-3 font-medium">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.length > 0 ? (
                          chartData.map((entry, index) => (
                            <motion.tr
                              key={entry._id}
                              className={`border-b ${borderClass} ${tableRowHoverClass}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: 0.05 * Math.min(index, 10),
                                duration: 0.2,
                              }}
                            >
                              <td className="px-4 py-2 font-mono text-xs">
                                {entry.deviceId}
                              </td>
                              <td className="px-4 py-2">
                                {entry.voltage.toFixed(2)}
                              </td>
                              <td className="px-4 py-2">
                                {entry.current.toFixed(3)}
                              </td>
                              <td className="px-4 py-2">
                                {Number(entry.power).toFixed(2)}
                              </td>
                              <td className={`px-4 py-2 ${tableTextClass}`}>
                                {entry.fullTimestamp}
                              </td>
                            </motion.tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center">
                              No data available for the selected time range
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Export Controls */}
                {filteredData.length > 0 && (
                  <motion.div
                    className="flex justify-center gap-4 mt-6"
                    variants={itemVariants}
                  >
                    <motion.button
                      className={`${buttonClass} px-4 py-2 rounded flex items-center gap-2`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Create CSV content
                        const headers =
                          "DeviceID,Voltage (V),Current (A),Power (W),Timestamp\n";
                        const csvContent = chartData
                          .map(
                            (entry) =>
                              `${entry.deviceId},${entry.voltage},${entry.current},${entry.power},"${entry.fullTimestamp}"`
                          )
                          .join("\n");

                        // Create download link
                        const blob = new Blob([headers + csvContent], {
                          type: "text/csv",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.setAttribute("href", url);
                        a.setAttribute(
                          "download",
                          `power-data-${timeFilter}-${
                            new Date().toISOString().split("T")[0]
                          }.csv`
                        );
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Export CSV
                    </motion.button>

                    <motion.button
                      className={`${buttonClass} px-4 py-2 rounded flex items-center gap-2`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Simple print function for the chart view
                        window.print();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Print View
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default PowerHistoryChart;
