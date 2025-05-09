import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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

const PowerHistoryChart = () => {
    const [data, setData] = useState<PowerHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [darkMode, setDarkMode] = useState(false);

    // Check system dark mode preference
    useEffect(() => {
        // Set initial dark mode from system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
        }

        // Add listener for changes in system preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        const fetchPowerHistory = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:5000/api/power-history");
                const result: ApiResponse = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    // Adding a small delay for animation effect
                    setTimeout(() => {
                        // Sort data by timestamp in ascending order for proper chart display
                        const sortedData = [...result.data].sort((a, b) =>
                            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                        );
                        setData(sortedData);
                        setLoading(false);
                    }, 600);
                } else {
                    throw new Error("Invalid data format received");
                }
            } catch (err) {
                console.error("Error fetching power history:", err);
                setError("Failed to fetch power history. Please try again later.");
                setData([]); // Set empty data array on error
                setLoading(false);
            }
        };

        fetchPowerHistory();
    }, []);

    // Calculate power (P = V * I) for each data point and prepare chart data
    const chartData = data.map(entry => {
        const date = new Date(entry.timestamp);
        return {
            ...entry,
            power: (entry.voltage * entry.current).toFixed(2),
            formattedTime: date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
            formattedDate: date.toLocaleDateString(),
            // Full timestamp for tooltip
            fullTimestamp: date.toLocaleString()
        };
    });

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Motion variants for animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    // Dynamic classes based on dark mode
    const mainBgClass = darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800";
    const cardBgClass = darkMode ? "bg-gray-800" : "bg-white";
    const cardHeaderClass = darkMode ? "bg-gray-800 text-white" : "bg-white";
    const chartBgClass = darkMode ? "bg-gray-700" : "bg-gray-50";
    const tableBgClass = darkMode ? "bg-gray-800" : "bg-white";
    const tableHeadClass = darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-700";
    const tableRowHoverClass = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
    const buttonClass = darkMode
        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
        : "bg-blue-500 hover:bg-blue-600 text-white";
    const loadingBgClass = darkMode ? "bg-gray-700" : "bg-gray-200";
    const errorBgClass = darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-700";
    const emptyBgClass = darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-50 text-yellow-700";
    const tagBgClass = darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-500";
    const tableTextClass = darkMode ? "text-gray-300" : "text-gray-600";
    const borderClass = darkMode ? "border-gray-700" : "border-gray-200";

    return (
        <div className={`${mainBgClass} min-h-screen transition-colors duration-300`}>
            <DCDataCards />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <motion.div
                    className={`${cardBgClass} shadow-lg rounded-lg p-6 transition-colors duration-300`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                        <motion.h1
                            className="text-3xl font-bold"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            DC Power History
                        </motion.h1>

                        <div className="flex items-center gap-4">
                            {data.length > 0 && (
                                <motion.div
                                    className={`text-sm ${tagBgClass} px-3 py-1 rounded-full`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Device: {data[0].deviceId}
                                </motion.div>
                            )}

                            <motion.button
                                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} transition-colors duration-300`}
                                onClick={toggleDarkMode}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {darkMode ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </motion.button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                className="space-y-4"
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className={`h-40 ${loadingBgClass} animate-pulse rounded`}></div>
                                <div className={`h-40 ${loadingBgClass} animate-pulse rounded`}></div>
                                <div className={`h-12 ${loadingBgClass} animate-pulse rounded mt-6`}></div>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                className={`${errorBgClass} p-4 rounded`}
                                key="error"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <strong className="block font-medium">Error:</strong>
                                <span>{error}</span>
                                <motion.button
                                    className={`mt-4 px-4 py-2 ${buttonClass} rounded transition-colors duration-300`}
                                    onClick={() => window.location.reload()}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Try Again
                                </motion.button>
                            </motion.div>
                        ) : data.length === 0 ? (
                            <motion.div
                                className={`${emptyBgClass} p-4 rounded`}
                                key="empty"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <strong className="block font-medium">No Data Available</strong>
                                <span>No power history records were found. Please check your connection to the API.</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="space-y-8"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                key="data"
                            >
                                <motion.div
                                    className={`${chartBgClass} p-4 rounded-lg shadow-sm transition-colors duration-300`}
                                    variants={itemVariants}
                                >
                                    <h3 className="text-lg font-medium mb-3">Voltage and Current Over Time</h3>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                                            <XAxis
                                                dataKey="formattedTime"
                                                label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                                                stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                                                tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                domain={['dataMin - 0.1', 'dataMax + 0.1']}
                                                label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
                                                stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                                                tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                domain={['dataMin - 0.05', 'dataMax + 0.05']}
                                                label={{ value: 'Current (A)', angle: -90, position: 'insideRight' }}
                                                stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                                                tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }}
                                            />
                                            <Tooltip
                                                formatter={(value, name) => {
                                                    if (name === "Voltage (V)") return [`${parseFloat(value).toFixed(2)} V`, name];
                                                    if (name === "Current (A)") return [`${parseFloat(value).toFixed(3)} A`, name];
                                                    return [value, name];
                                                }}
                                                labelFormatter={(_, data) => {
                                                    if (data && data.length > 0) {
                                                        return `${data[0].payload.fullTimestamp}`;
                                                    }
                                                    return "";
                                                }}
                                                contentStyle={{
                                                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                                                    border: darkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                                                    color: darkMode ? '#F9FAFB' : '#1F2937'
                                                }}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    color: darkMode ? '#D1D5DB' : '#4B5563'
                                                }}
                                            />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="voltage"
                                                stroke="#4F46E5"
                                                strokeWidth={2}
                                                name="Voltage (V)"
                                                dot={{ r: 3 }}
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
                                                dot={{ r: 3 }}
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
                                    <h3 className="text-lg font-medium mb-3">Power Consumption Over Time</h3>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                                            <XAxis
                                                dataKey="formattedTime"
                                                label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                                                stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                                                tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }}
                                            />
                                            <YAxis
                                                domain={['dataMin - 0.2', 'dataMax + 0.2']}
                                                label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
                                                stroke={darkMode ? "#9CA3AF" : "#6B7280"}
                                                tick={{ fill: darkMode ? "#D1D5DB" : "#4B5563" }}
                                            />
                                            <Tooltip
                                                formatter={(value, name) => [`${parseFloat(value).toFixed(2)} W`, name]}
                                                labelFormatter={(_, data) => {
                                                    if (data && data.length > 0) {
                                                        return `${data[0].payload.fullTimestamp}`;
                                                    }
                                                    return "";
                                                }}
                                                contentStyle={{
                                                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                                                    border: darkMode ? '1px solid #374151' : '1px solid #E5E7EB',
                                                    color: darkMode ? '#F9FAFB' : '#1F2937'
                                                }}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    color: darkMode ? '#D1D5DB' : '#4B5563'
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="power"
                                                stroke="#F59E0B"
                                                strokeWidth={2}
                                                name="Power (W)"
                                                dot={{ r: 3 }}
                                                activeDot={{ r: 5, strokeWidth: 2 }}
                                                isAnimationActive={true}
                                                animationDuration={1500}
                                                animationEasing="ease-in-out"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>

                                <motion.div
                                    className={`${tableBgClass} rounded-lg shadow mt-6 transition-colors duration-300`}
                                    variants={itemVariants}
                                >
                                    <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b ${borderClass}`}>
                                        <h3 className="text-lg font-medium">Raw Data Records</h3>
                                        <div className={`${tagBgClass} px-3 py-1 rounded-full text-sm mt-1 sm:mt-0`}>
                                            Showing {data.length} records
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
                                            {chartData.map((entry, index) => (
                                                <motion.tr
                                                    key={entry._id}
                                                    className={`border-b ${borderClass} ${tableRowHoverClass}`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.05 * index, duration: 0.2 }}
                                                >
                                                    <td className="px-4 py-2 font-mono text-xs">{entry.deviceId}</td>
                                                    <td className="px-4 py-2">{parseFloat(entry.voltage).toFixed(2)}</td>
                                                    <td className="px-4 py-2">{parseFloat(entry.current).toFixed(3)}</td>
                                                    <td className="px-4 py-2">{entry.power}</td>
                                                    <td className={`px-4 py-2 ${tableTextClass}`}>
                                                        {new Date(entry.timestamp).toLocaleString()}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default PowerHistoryChart;