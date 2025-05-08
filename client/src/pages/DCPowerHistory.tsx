import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";



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

    useEffect(() => {
        const fetchPowerHistory = async () => {
            try {
                setLoading(true);
                const response = await fetch("http://localhost:5000/api/power-history");
                const result: ApiResponse = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    // Sort data by timestamp in ascending order for proper chart display
                    const sortedData = [...result.data].sort((a, b) =>
                        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    );
                    setData(sortedData);
                } else {
                    throw new Error("Invalid data format received");
                }
            } catch (err) {
                console.error("Error fetching power history:", err);
                setError("Failed to fetch power history. Please try again later.");
                setData([]); // Set empty data array on error
            } finally {
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

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                <h2 className="text-2xl font-semibold">DC Power History</h2>
                {data.length > 0 && (
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Device: {data[0].deviceId}
                    </div>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    <div className="h-40 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-40 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-12 bg-gray-200 animate-pulse rounded mt-6"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 text-red-700 p-4 rounded">
                    <strong className="block font-medium">Error:</strong>
                    <span>{error}</span>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            ) : data.length === 0 ? (
                <div className="bg-yellow-50 text-yellow-700 p-4 rounded">
                    <strong className="block font-medium">No Data Available</strong>
                    <span>No power history records were found. Please check your connection to the API.</span>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">Voltage and Current Over Time</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="formattedTime"
                                    label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    domain={['dataMin - 0.1', 'dataMax + 0.1']}
                                    label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    domain={['dataMin - 0.05', 'dataMax + 0.05']}
                                    label={{ value: 'Current (A)', angle: -90, position: 'insideRight' }}
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
                                />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="voltage"
                                    stroke="#4F46E5"
                                    strokeWidth={2}
                                    name="Voltage (V)"
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5, strokeWidth: 2 }}
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
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mt-6">
                        <h3 className="text-lg font-medium mb-3">Power Consumption Over Time</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="formattedTime"
                                    label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                                />
                                <YAxis
                                    domain={['dataMin - 0.2', 'dataMax + 0.2']}
                                    label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip
                                    formatter={(value, name) => [`${parseFloat(value).toFixed(2)} W`, name]}
                                    labelFormatter={(_, data) => {
                                        if (data && data.length > 0) {
                                            return `${data[0].payload.fullTimestamp}`;
                                        }
                                        return "";
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="power"
                                    stroke="#F59E0B"
                                    strokeWidth={2}
                                    name="Power (W)"
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5, strokeWidth: 2 }}
                                    isAnimationActive={true}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-lg shadow mt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b">
                            <h3 className="text-lg font-medium">Raw Data Records</h3>
                            <div className="text-sm text-gray-500 mt-1 sm:mt-0">
                                Showing {data.length} records
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Device ID</th>
                                    <th className="px-4 py-3 font-medium">Voltage (V)</th>
                                    <th className="px-4 py-3 font-medium">Current (A)</th>
                                    <th className="px-4 py-3 font-medium">Power (W)</th>
                                    <th className="px-4 py-3 font-medium">Timestamp</th>
                                </tr>
                                </thead>
                                <tbody>
                                {chartData.map((entry) => (
                                    <tr key={entry._id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 font-mono text-xs">{entry.deviceId}</td>
                                        <td className="px-4 py-2">{parseFloat(entry.voltage).toFixed(2)}</td>
                                        <td className="px-4 py-2">{parseFloat(entry.current).toFixed(3)}</td>
                                        <td className="px-4 py-2">{entry.power}</td>
                                        <td className="px-4 py-2 text-gray-600">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PowerHistoryChart;