import React, {useEffect, useState} from "react";
import axios from "axios";
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
import {motion, AnimatePresence} from "framer-motion";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Calendar, ChevronDown, RefreshCw, Moon, Sun} from "lucide-react";

const GeneratorFuel = ({deviceId = "88:13:BF:0C:3B:6C"}) => {
    const [fuelHistory, setFuelHistory] = useState<any[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
    const [currentFuel, setCurrentFuel] = useState<number | null>(null);
    const [temperature, setTemperature] = useState<{ value: number; unit: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState("30d");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [darkMode, setDarkMode] = useState(false);

    // Check system preference for dark mode on initial load
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            setDarkMode(isDarkMode);

            // Listen for changes in system preference
            const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleDarkModeChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);

            darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
            return () => darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
        }
    }, []);

    const filterOptions = [
        {value: "24h", label: "Last 24 Hours"},
        {value: "7d", label: "Last 7 Days"},
        {value: "30d", label: "Last 30 Days"},
        {value: "all", label: "All Time"},
    ];

    const fetchData = async () => {
        setRefreshing(true);
        try {
            // Fetch fuel history
            const historyRes = await axios.get(
                `http://localhost:5000/api/fuel-level-history/${deviceId}`
            );

            if (historyRes.data?.data) {
                const sortedData = historyRes.data.data
                    .map((item: any) => ({
                        ...item,
                        timestamp: new Date(item.timestamp),
                        formattedDate: new Date(item.timestamp).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        }),
                    }))
                    .sort((a: any, b: any) => a.timestamp - b.timestamp);

                setFuelHistory(sortedData);
                applyTimeFilter(sortedData, timeFilter);
            }

            const fuelRes = await axios.get(
                `http://localhost:5000/api/fuel-level/${deviceId}`
            );
            setCurrentFuel(fuelRes.data?.data?.fuelLevelPercentage);

            // Fetch temperature
            const tempRes = await axios.get(`http://localhost:5000/api/temperature`);
            if (tempRes.data?.data?.[0]?.temperatureC) {
                setTemperature({
                    value: tempRes.data.data[0].temperatureC,
                    unit: 'C'
                });
            }

        } catch (err) {
            console.error("Data fetch error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const applyTimeFilter = (data: any[], filter: string) => {
        const now = new Date();
        let filteredData;

        switch (filter) {
            case "24h":
                const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                filteredData = data.filter((item: any) => item.timestamp >= oneDayAgo);
                break;
            case "7d":
                const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                filteredData = data.filter((item: any) => item.timestamp >= sevenDaysAgo);
                break;
            case "30d":
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                filteredData = data.filter((item: any) => item.timestamp >= thirtyDaysAgo);
                break;
            case "all":
            default:
                filteredData = data;
                break;
        }

        setFilteredHistory(filteredData.map((item: any) => ({
            ...item,
            timestamp: item.formattedDate
        })));
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        const fetchAll = async () => {
            setRefreshing(true);
            await fetchData();
            setLastUpdated(new Date());
            setRefreshing(false);
        };
        fetchAll();
        intervalId = setInterval(fetchAll, 5000);
        return () => clearInterval(intervalId);
    }, [deviceId]);

    useEffect(() => {
        if (fuelHistory.length > 0) {
            applyTimeFilter(fuelHistory, timeFilter);
        }
    }, [timeFilter, fuelHistory]);

    const getFuelLevelColor = (level: number | null) => {
        if (level === null) return darkMode ? "text-gray-400" : "text-gray-500";
        if (level <= 20) return "text-red-500";
        if (level <= 50) return darkMode ? "text-yellow-400" : "text-yellow-500";
        return darkMode ? "text-green-400" : "text-green-500";
    };

    const getWaterColor = (level: number | null) => {
        if (level === null) return darkMode ? "from-gray-500 to-gray-600" : "from-gray-400 to-gray-500";
        if (level <= 20) return darkMode ? "from-red-500 to-red-400" : "from-red-600 to-red-500";
        if (level <= 50) return darkMode ? "from-yellow-500 to-yellow-400" : "from-yellow-600 to-yellow-500";
        return darkMode ? "from-green-500 to-green-400" : "from-green-600 to-green-500";
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData().then(() => {
            setLastUpdated(new Date());
            setRefreshing(false);
        });
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Dynamically determine colors based on dark mode
    const theme = {
        bg: darkMode ? "bg-gray-900" : "bg-white",
        text: darkMode ? "text-gray-100" : "text-gray-800",
        subtext: darkMode ? "text-gray-400" : "text-gray-500",
        border: darkMode ? "border-gray-700" : "border-gray-200",
        cardBg: darkMode ? "bg-gray-800" : "bg-gray-50",
        buttonHover: darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100",
        chartGrid: darkMode ? "#374151" : "#f0f0f0",
        chartAxis: darkMode ? "#4B5563" : "#e5e7eb",
        chartText: darkMode ? "#9CA3AF" : "#6b7280",
        tooltipBg: darkMode ? "rgba(31, 41, 55, 0.9)" : "rgba(255, 255, 255, 0.9)",
        tooltipBorder: darkMode ? "#4B5563" : "#e5e7eb",
        tooltipText: darkMode ? "#F3F4F6" : "#374151",
        alertBg: darkMode ? "bg-red-900/30" : "bg-red-50",
        alertBorder: darkMode ? "border-red-700" : "border-red-500",
        alertText: darkMode ? "text-red-300" : "text-red-700",
        lineColor: darkMode ? "#34D399" : "#10b981",
        dotFill: darkMode ? "#1F2937" : "#FFFFFF",
        dropdownBg: darkMode ? "bg-gray-800" : "bg-white",
        dropdownBorder: darkMode ? "border-gray-700" : "border-gray-300",
        buttonRing: darkMode ? "focus:ring-blue-400" : "focus:ring-blue-500",
    };

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.5}}
            className={`w-full p-6 rounded-lg shadow-2xl border-2 ${theme.bg} ${theme.border} transition-colors duration-300`}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-green-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg ${theme.text}`}>Generator Fuel Monitor</h2>
                <div className="flex items-center space-x-2">
                    <motion.button
                        whileTap={{scale: 0.95}}
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full ${theme.buttonHover}`}
                    >
                        {darkMode ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="5" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                            </svg>
                        )}
                    </motion.button>
                    <motion.button
                        whileTap={{scale: 0.95}}
                        onClick={handleRefresh}
                        className={`p-2 rounded-full border border-blue-300 bg-blue-100 dark:bg-blue-900 dark:border-blue-700 shadow-md ${refreshing ? "animate-spin" : ""} ${theme.buttonHover}`}
                        disabled={refreshing}
                    >
                        <svg className={`w-6 h-6 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1 1 19 5.635" />
                        </svg>
                    </motion.button>
                    {lastUpdated && (
                        <span className="text-xs text-gray-400 ml-2">Last updated: {lastUpdated instanceof Date ? lastUpdated.toLocaleTimeString() : ""}</span>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <motion.div
                        animate={{rotate: 360}}
                        transition={{duration: 1, repeat: Infinity, ease: "linear"}}
                        className={`w-12 h-12 border-4 ${darkMode ? "border-gray-700 border-t-blue-400" : "border-gray-200 border-t-blue-500"} rounded-full`}
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {/* Enhanced Fuel Level Display */}
                        <motion.div
                            whileHover={{y: -5}}
                            className={`p-4 rounded-lg border ${theme.cardBg} ${theme.border} transition-colors duration-300`}
                        >
                            <p className={`text-sm mb-1 ${theme.subtext}`}>Current Fuel Level</p>
                            <div className="flex items-center justify-between">
                                <motion.div
                                    className={`text-2xl font-bold ${getFuelLevelColor(currentFuel)}`}
                                    initial={{scale: 0.9}}
                                    animate={{scale: 1}}
                                    key={currentFuel}
                                    transition={{duration: 0.3}}
                                >
                                    {currentFuel !== null ? `${currentFuel.toFixed(1)}%` : "N/A"}
                                </motion.div>

                                {/* Improved Fuel Tank Visualization */}
                                <div className="relative w-20 h-24 border-2 rounded-lg overflow-hidden">
                                    {/* Tank background */}
                                    <div className={`absolute inset-0 ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}></div>

                                    {/* Fluid container with water animation effect */}
                                    <div className="absolute inset-0 overflow-hidden">
                                        {/* Main fluid body */}
                                        <motion.div
                                            className={`absolute left-0 right-0 bottom-0 bg-gradient-to-b ${getWaterColor(currentFuel)}`}
                                            initial={{ height: "0%" }}
                                            animate={{ height: `${currentFuel || 0}%` }}
                                            transition={{
                                                duration: 0.8,
                                                type: "spring",
                                                stiffness: 50
                                            }}
                                        >
                                            {/* Wave effect 1 - Top surface animation */}
                                            <motion.div
                                                className="absolute left-0 right-0 h-2 top-0 opacity-80"
                                                style={{
                                                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                                                    backgroundSize: "200% 100%"
                                                }}
                                                animate={{
                                                    backgroundPosition: ["0% 0%", "200% 0%"],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    ease: "linear",
                                                    repeat: Infinity
                                                }}
                                            />

                                            {/* Wave effect 2 - Opposite direction */}
                                            <motion.div
                                                className="absolute left-0 right-0 h-2 top-0 opacity-50"
                                                style={{
                                                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                                                    backgroundSize: "200% 100%"
                                                }}
                                                animate={{
                                                    backgroundPosition: ["200% 0%", "0% 0%"],
                                                }}
                                                transition={{
                                                    duration: 3.5,
                                                    ease: "linear",
                                                    repeat: Infinity
                                                }}
                                            />

                                            {/* Bubble effects */}
                                            <div className="absolute inset-0 overflow-hidden">
                                                <div className="bubble-container">
                                                    {[...Array(4)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className={`absolute rounded-full ${darkMode ? "bg-white/20" : "bg-white/30"}`}
                                                            style={{
                                                                width: `${3 + (i % 3)}px`,
                                                                height: `${3 + (i % 3)}px`,
                                                                left: `${20 + (i * 20)}%`
                                                            }}
                                                            initial={{
                                                                bottom: "-10%",
                                                                opacity: 0.7,
                                                                scale: 0.3
                                                            }}
                                                            animate={{
                                                                bottom: "110%",
                                                                opacity: [0.7, 0.9, 0],
                                                                scale: [0.3, 0.6, 1]
                                                            }}
                                                            transition={{
                                                                duration: 2 + i,
                                                                repeat: Infinity,
                                                                delay: i * 0.8,
                                                                ease: "easeInOut"
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Tank overlay, glass effect */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className={`absolute inset-y-0 left-0 w-1 ${darkMode ? "bg-white/5" : "bg-white/20"}`}></div>
                                        <div className={`absolute inset-x-0 top-0 h-1 ${darkMode ? "bg-white/10" : "bg-white/30"}`}></div>
                                    </div>

                                    {/* Level markings */}
                                    {[25, 50, 75].map(level => (
                                        <div
                                            key={level}
                                            className={`absolute w-2 h-px left-0 ${darkMode ? "bg-gray-500" : "bg-gray-400"}`}
                                            style={{ bottom: `${level}%` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {temperature && (
                            <motion.div
                                whileHover={{y: -5}}
                                className={`p-4 rounded-lg border ${theme.cardBg} ${theme.border} transition-colors duration-300`}
                            >
                                <p className={`text-sm mb-1 ${theme.subtext}`}>Temperature</p>
                                <p className={`text-2xl font-bold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                                    {temperature.value ? `${temperature.value}°${temperature.unit}` : "N/A"}
                                </p>
                            </motion.div>
                        )}

                        <motion.div
                            whileHover={{y: -5}}
                            className={`p-4 rounded-lg border ${theme.cardBg} ${theme.border} transition-colors duration-300`}
                        >
                            <p className={`text-sm mb-1 ${theme.subtext}`}>Device ID</p>
                            <p className={`text-md font-mono ${darkMode ? "text-gray-300" : "text-gray-800"}`}>{deviceId}</p>
                        </motion.div>
                    </div>

                    <div className="mb-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <Calendar size={18} className={`mr-2 ${theme.subtext}`}/>
                            <span
                                className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>History</span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                className={`flex items-center px-3 py-2 text-sm ${theme.dropdownBg} ${theme.dropdownBorder} rounded-md ${theme.buttonHover} focus:outline-none focus:ring-2 ${theme.buttonRing} focus:border-blue-500 transition-colors duration-300`}>
                                {filterOptions.find(option => option.value === timeFilter)?.label}
                                <ChevronDown size={16} className="ml-2"/>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className={darkMode ? "dark" : ""}>
                                {filterOptions.map((option) => (
                                    <DropdownMenuItem
                                        key={option.value}
                                        onClick={() => setTimeFilter(option.value)}
                                        className="cursor-pointer"
                                    >
                                        {option.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{duration: 0.5}}
                        className="w-full h-80"
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={filteredHistory}
                                margin={{top: 5, right: 20, left: 5, bottom: 5}}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid}/>
                                <XAxis
                                    dataKey="timestamp"
                                    tick={{fontSize: 12, fill: theme.chartText}}
                                    tickLine={false}
                                    axisLine={{stroke: theme.chartAxis}}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{fontSize: 12, fill: theme.chartText}}
                                    tickLine={false}
                                    axisLine={{stroke: theme.chartAxis}}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: theme.tooltipBg,
                                        border: `1px solid ${theme.tooltipBorder}`,
                                        borderRadius: "8px",
                                        boxShadow: darkMode ? "0 4px 6px rgba(0, 0, 0, 0.3)" : "0 4px 6px rgba(0, 0, 0, 0.1)"
                                    }}
                                    labelStyle={{fontWeight: "bold", color: theme.tooltipText}}
                                    itemStyle={{padding: "2px 0"}}
                                    cursor={{stroke: darkMode ? "#6B7280" : "#9CA3AF", strokeWidth: 1}}
                                />
                                <Legend
                                    wrapperStyle={{paddingTop: 10}}
                                    iconType="circle"
                                    formatter={(value) => (
                                        <span style={{color: darkMode ? "#F3F4F6" : "#374151"}}>{value}</span>
                                    )}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="fuelLevelPercentage"
                                    stroke={theme.lineColor}
                                    strokeWidth={3}
                                    dot={{r: 4, strokeWidth: 2, fill: theme.dotFill}}
                                    activeDot={{r: 6, strokeWidth: 0, fill: theme.lineColor}}
                                    name="Fuel Level (%)"
                                    animationDuration={1500}
                                    animationEasing="ease-in-out"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    <div className={`mt-6 pt-4 border-t ${theme.border} transition-colors duration-300`}>
                        <AnimatePresence>
                            {filteredHistory.length === 0 && (
                                <motion.p
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    exit={{opacity: 0}}
                                    className={`text-center py-4 ${theme.subtext}`}
                                >
                                    No data available for selected time period
                                </motion.p>
                            )}

                            {currentFuel !== null && currentFuel <= 20 && (
                                <motion.div
                                    initial={{opacity: 0, x: -20}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{duration: 0.5}}
                                    className={`p-3 ${theme.alertBg} border-l-4 ${theme.alertBorder} ${theme.alertText} rounded transition-colors duration-300`}
                                >
                                    <p className="font-medium">Low fuel alert!</p>
                                    <p className="text-sm">Generator fuel level is critically low. Please refill
                                        soon.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default GeneratorFuel;