import React, { useEffect, useState } from "react";
import { Battery, Zap, Clock, AlertTriangle, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

type DCData = {
    _id: string;
    deviceId: string;
    voltage: number;
    current: number;
    timestamp: string;
    __v: number;
}

// Helper function to get appropriate color based on value
const getVoltageColor = (voltage) => {
    if (voltage >= 12) return "text-green-500 dark:text-green-400";
    if (voltage >= 11) return "text-yellow-500 dark:text-yellow-400";
    if (voltage >= 10) return "text-orange-500 dark:text-orange-400";
    return "text-red-500 dark:text-red-400";
};

const getCurrentColor = (current) => {
    if (current <= 0.5) return "text-green-500 dark:text-green-400";
    if (current <= 1.0) return "text-yellow-500 dark:text-yellow-400";
    return "text-red-500 dark:text-red-400";
};

// Device Information Card
const DeviceInfoCard = ({ data, index }) => {
    const formattedDeviceId = data ? data.deviceId : "N/A";

    return (
        <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0 }}
            className="rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Device Information</h3>
            </div>

            {data ? (
                <div className="p-6 space-y-4">
                    <div className="flex items-center">
                        <div className="mr-3">
                            <Cpu className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Device ID</div>
                            <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">{formattedDeviceId}</div>
                        </div>
                    </div>

                    <div className="flex items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                        <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
              Last Updated: {new Date(data.timestamp).toLocaleString()}
            </span>
                    </div>
                </div>
            ) : (
                <div className="p-8 flex flex-col items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-400 dark:text-gray-500 text-center">No device information available</p>
                </div>
            )}
        </motion.div>
    );
};

// Voltage Card
const VoltageCard = ({ data, index }) => {
    const [showProgress, setShowProgress] = useState(false);

    // Trigger animation after component mounts
    useEffect(() => {
        if (data) {
            const timer = setTimeout(() => {
                setShowProgress(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [data]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0 }}
            className="rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700">
                <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">Voltage</h3>
            </div>

            {data ? (
                <div className="p-6">
                    <div className="flex flex-col items-center mb-4">
                        <Battery className="h-12 w-12 text-blue-500 dark:text-blue-400 mb-2" />
                        <div className={`text-3xl font-bold ${getVoltageColor(data.voltage)}`}>
                            {data.voltage.toFixed(2)} V
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: showProgress ? `${Math.min(100, (data.voltage / 15) * 100)}%` : 0 }}
                                transition={{
                                    duration: 1.5,
                                    ease: "easeOut",
                                }}
                                className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
                            />

                            {/* Loading animation overlay */}
                            {!showProgress && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-700 to-transparent animate-shimmer"
                                     style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}/>
                            )}
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>0V</span>
                            <span>7.5V</span>
                            <span>15V</span>
                        </div>

                        <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-300">
                            {data.voltage < 10 ? (
                                <span className="text-red-500 dark:text-red-400">Low Voltage Alert</span>
                            ) : data.voltage < 11 ? (
                                <span className="text-orange-500 dark:text-orange-400">Voltage Below Optimal</span>
                            ) : (
                                <span className="text-green-500 dark:text-green-400">Voltage Normal</span>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-8 flex flex-col items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-400 dark:text-gray-500 text-center">No voltage data available</p>
                </div>
            )}
        </motion.div>
    );
};

// Current Card
const CurrentCard = ({ data, index }) => {
    const [showProgress, setShowProgress] = useState(false);

    // Trigger animation after component mounts
    useEffect(() => {
        if (data) {
            const timer = setTimeout(() => {
                setShowProgress(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [data]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0}}
            className="rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700">
                <h3 className="text-lg font-bold text-amber-600 dark:text-amber-400">Current</h3>
            </div>

            {data ? (
                <div className="p-6">
                    <div className="flex flex-col items-center mb-4">
                        <Zap className="h-12 w-12 text-amber-500 dark:text-amber-400 mb-2" />
                        <div className={`text-3xl font-bold ${getCurrentColor(data.current)}`}>
                            {data.current.toFixed(2)} A
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: showProgress ? `${Math.min(100, (data.current / 2) * 100)}%` : 0 }}
                                transition={{
                                    duration: 1.5,
                                    ease: "easeOut",
                                }}
                                className="h-full bg-amber-500 dark:bg-amber-400 rounded-full"
                            />

                            {/* Loading animation overlay */}
                            {!showProgress && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200 dark:via-amber-700 to-transparent animate-shimmer"
                                     style={{ backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}/>
                            )}
                        </div>

                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>0A</span>
                            <span>1A</span>
                            <span>2A</span>
                        </div>

                        <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-300">
                            {data.current > 1.5 ? (
                                <span className="text-red-500 dark:text-red-400">High Current Alert</span>
                            ) : data.current > 0.8 ? (
                                <span className="text-yellow-500 dark:text-yellow-400">Current Above Normal</span>
                            ) : (
                                <span className="text-green-500 dark:text-green-400">Current Normal</span>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-8 flex flex-col items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-gray-400 dark:text-gray-500 text-center">No current data available</p>
                </div>
            )}
        </motion.div>
    );
};

// Empty Card Component for when no data is available
const EmptyCard = ({ index, title }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <h3 className="text-lg font-bold text-gray-400 dark:text-gray-500">{title}</h3>
            </div>
            <div className="p-6 flex flex-col items-center justify-center py-10">
                <AlertTriangle className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-400 dark:text-gray-500 text-sm text-center">
                    No {title.toLowerCase()} data available
                </p>
            </div>
        </motion.div>
    );
};

// Add shimmer animation keyframes
const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

export default function DCDataCards() {
    const [data, setData] = useState<DCData[]>([]);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    // Detect system theme preference and set up listener
    useEffect(() => {
        // Add shimmer animation to head
        const style = document.createElement('style');
        style.innerHTML = shimmerKeyframes;
        document.head.appendChild(style);

        // Check initial preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setDarkMode(mediaQuery.matches);

        // Set up listener for theme changes
        const handleChange = (e) => setDarkMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        // Fetch data from the API
        axios
            .get("http://localhost:5000/api/dc-current")
            .then((res) => {
                if (res.data.success) {
                    setData(res.data.data);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch DC current data:", err);
            })
            .finally(() => setLoading(false));

        // Clean up
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
            document.head.removeChild(style);
        };
    }, []);

    // Apply dark mode to body (in a real app you'd use Context or CSS variables)
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <div className="max-w-6xl mx-auto p-4 text-gray-900 dark:text-gray-100">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent"
            >
                DC Current Device Overview
            </motion.h2>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-t-green-500 dark:border-t-green-400"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.length > 0 ? (
                        <>
                            <VoltageCard data={data[0]} index={1} />
                            <CurrentCard data={data[0]} index={2} />
                            <DeviceInfoCard data={data[0]} index={0} />
                        </>
                    ) : (
                        <>
                            <EmptyCard index={0} title="Device" />
                            <EmptyCard index={1} title="Voltage" />
                            <EmptyCard index={2} title="Current" />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}