import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Battery, Clock, Percent, Zap } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import useBackupBatteryStore from '@/store/backupBatteryStore'

const BackupBattery = () => {
    // Get data and actions from the store
    const { 
        currentData, isLoadingCurrent, currentError,
        historyData, isLoadingHistory, historyError, totalPages, currentPage,
        chartData, isLoadingChart, chartError,
        fetchCurrentData, fetchHistoryData, fetchChartData
    } = useBackupBatteryStore();

    const [selectedFilter, setSelectedFilter] = useState('24h');
    const [tableCurrentPage, setTableCurrentPage] = useState(1);
    const recordsPerPage = 10;
    
    // Default device ID - could be from user settings or props
    const defaultDeviceId = '88:13:BF:0C:3B:6C';

    useEffect(() => {
        document.title = 'Power Mate | Backup Battery'
    })

    const filterOptions = [
        { label: 'Last 24 Hours', value: '24h', days: 1 },
        { label: 'Last 7 Days', value: '7d', days: 7 },
        { label: 'Last Week', value: 'week', days: 7 },
        { label: 'Last Month', value: 'month', days: 30 },
    ];

    // Function to handle filter change - now only affects table pagination, not charts
    const handleFilterChange = (filterValue) => {
        setSelectedFilter(filterValue);
        
        // Get date range based on selected filter - only for history data table
        const { startDate, endDate } = getDateRange(filterValue);
        
        // Reset pagination when filter changes
        setTableCurrentPage(1);
        fetchHistoryData({ 
            deviceId: defaultDeviceId, 
            startDate, 
            endDate, 
            page: 1, 
            limit: recordsPerPage 
        });
        
        // For charts, we'll continue to use all data, no filtering
    };
    
    // Calculate date range based on selected filter
    const getDateRange = (filterValue) => {
        const endDate = new Date();
        const startDate = new Date();
        
        const filter = filterOptions.find(option => option.value === filterValue);
        if (filter) {
            startDate.setDate(startDate.getDate() - filter.days);
        } else {
            // Default to 24 hours
            startDate.setDate(startDate.getDate() - 1);
        }
        
        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        };
    };

    // Add function to handle page changes
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setTableCurrentPage(newPage);
            
            // Get date range based on selected filter
            const { startDate, endDate } = getDateRange(selectedFilter);
            
            fetchHistoryData({ 
                deviceId: defaultDeviceId, 
                startDate, 
                endDate, 
                page: newPage, 
                limit: recordsPerPage 
            });
        }
    };

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
                    <p className="font-medium">{`Time: ${label}`}</p>
                    <p className="text-blue-500">{`Voltage: ${payload[0].value}V`}</p>
                    <p className="text-amber-500">{`Current: ${payload[1].value}A`}</p>
                    <p className="text-green-500">{`Battery: ${payload[2].value}%`}</p>
                </div>
            );
        }
        return null;
    };

    // Get the latest battery reading for display cards
    const getLatestReading = () => {
        return currentData.length > 0 ? currentData[0] : null;
    }

    // Initialize data on component mount
    useEffect(() => {
        // Fetch current data for the metrics cards
        fetchCurrentData(defaultDeviceId);
        
        // Get initial date range based on default filter for table only
        const { startDate, endDate } = getDateRange(selectedFilter);
        
        // Fetch historical data for the table with date range
        fetchHistoryData({ 
            deviceId: defaultDeviceId, 
            startDate, 
            endDate, 
            page: tableCurrentPage, 
            limit: recordsPerPage 
        });
        
        // Fetch chart data with no date filtering - show all data
        fetchChartData({ deviceId: defaultDeviceId })
            .then(data => {
                console.log('Chart data fetched:', data); // Debug log
                if (!data || data.length === 0) {
                    console.warn('No chart data returned from API');
                }
            })
            .catch(err => {
                console.error('Error fetching chart data:', err);
            });
        
        // Set up auto-refresh for real-time data every 30 seconds
        const intervalId = setInterval(() => {
            fetchCurrentData(defaultDeviceId);
        }, 30000);
        
        // Clean up interval on unmount
        return () => clearInterval(intervalId);
    }, []);

    // Show debugging info in component
    useEffect(() => {
        console.log('Chart data state:', chartData);
    }, [chartData]);

    // Get latest reading for card displays
    const latestReading = getLatestReading();
    
    // Create fallback data if no chart data is available
    const chartDataWithFallback = chartData && chartData.length > 0 ? chartData : [
        { time: '00:00', voltage: 12.5, current: 2.1, percentage: 95 },
        { time: '04:00', voltage: 12.3, current: 2.3, percentage: 90 },
        { time: '08:00', voltage: 12.0, current: 2.5, percentage: 85 },
        { time: '12:00', voltage: 11.8, current: 2.4, percentage: 80 },
        { time: '16:00', voltage: 11.5, current: 2.2, percentage: 70 },
        { time: '20:00', voltage: 11.2, current: 2.0, percentage: 60 }
    ];

    return (
        <div className="space-y-6">
            {currentError && (
                <div className="bg-red-100 p-3 rounded-md border border-red-300 text-red-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>{currentError}</span>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Backup Battery Dashboard</h1>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Time period:</span>
                    {filterOptions.map((option) => (
                        <Button
                            key={option.value}
                            variant={selectedFilter === option.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterChange(option.value)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Voltage</CardTitle>
                        <CardDescription>Real-time voltage monitoring</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4 items-center justify-center'>
                        <div className='items-center justify-center text-center'>
                            <Battery className="h-10 w-10 text-primary mx-auto" />
                            <h1 className='text-xl font-bold mt-2'>
                                {isLoadingCurrent && !latestReading ? (
                                    <Skeleton className="h-6 w-16 mx-auto" />
                                ) : (
                                    `${latestReading?.voltage?.toFixed(1) || '0.0'}V`
                                )}
                            </h1>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <h1 className="text-sm text-muted-foreground">Normal operating range: 10.5V-12.5V</h1>
                    </CardFooter>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Current</CardTitle>
                        <CardDescription>Real-time current monitoring</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4 items-center justify-center'>
                        <div className='items-center justify-center text-center'>
                            <Zap className="h-10 w-10 text-amber-500 mx-auto" />
                            <h1 className='text-xl font-bold mt-2'>
                                {isLoadingCurrent && !latestReading ? (
                                    <Skeleton className="h-6 w-16 mx-auto" />
                                ) : (
                                    `${latestReading?.current?.toFixed(1) || '0.0'}A`
                                )}
                            </h1>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <h1 className="text-sm text-muted-foreground">Peak current: 4.2A</h1>
                    </CardFooter>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Capacity</CardTitle>
                        <CardDescription>Capacity as percentage</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4 items-center justify-center'>
                        <div className='items-center justify-center text-center'>
                            <Percent className="h-10 w-10 text-green-500 mx-auto" />
                            <h1 className='text-xl font-bold mt-2'>
                                {isLoadingCurrent && !latestReading ? (
                                    <Skeleton className="h-6 w-16 mx-auto" />
                                ) : (
                                    `${latestReading?.percentage || '0'}%`
                                )}
                            </h1>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <h1 className="text-sm text-muted-foreground">Real time battery percentage</h1>
                    </CardFooter>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                        <CardDescription>Device health status</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4 items-center justify-center'>
                        <div className='items-center justify-center text-center'>
                            <Clock className="h-10 w-10 text-amber-500 mx-auto" />
                            <h1 className='text-xl font-bold mt-2'>
                                {isLoadingCurrent && !latestReading ? (
                                    <Skeleton className="h-6 w-16 mx-auto" />
                                ) : (
                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                        !latestReading ? 'bg-gray-100 text-gray-800' :
                                        latestReading.status === 'Normal' ? 'bg-green-100 text-green-800' :
                                        latestReading.status === 'Warning' ? 'bg-amber-100 text-amber-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {latestReading?.status || 'Unknown'}
                                    </span>
                                )}
                            </h1>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <h1 className="text-sm text-muted-foreground">
                            Last Update: {latestReading ? new Date(latestReading.timestamp).toLocaleString() : 'Never'}
                        </h1>
                    </CardFooter>
                </Card>
            </div>

            {/* Combined Chart */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Battery Metrics Over Time</CardTitle>
                    <CardDescription>
                        {chartData.length > 0 
                            ? 'Historical battery performance' 
                            : 'Sample battery performance (API data unavailable)'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    {isLoadingChart ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Skeleton className="h-4 w-32 mx-auto mb-2" />
                                <Skeleton className="h-[300px] w-full" />
                            </div>
                        </div>
                    ) : chartError ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center text-red-500">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                <p>{chartError}</p>
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartDataWithFallback}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="time" />

                                <YAxis
                                    yAxisId="voltage"
                                    orientation="left"
                                    stroke="#3b82f6"
                                    domain={[10.5, 14]}
                                    label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
                                />

                                <YAxis
                                    yAxisId="current"
                                    orientation="right"
                                    stroke="#f59e0b"
                                    domain={[0, 5]}
                                    label={{ value: 'Current (A)', angle: -90, position: 'insideRight' }}
                                />

                                <YAxis
                                    yAxisId="percentage"
                                    orientation="right"
                                    stroke="#10b981"
                                    domain={[0, 100]}
                                    allowDataOverflow={true}
                                    hide
                                />

                                <Tooltip content={<CustomTooltip />} />
                                <Legend />

                                <Line
                                    yAxisId="voltage"
                                    type="monotone"
                                    dataKey="voltage"
                                    name="Voltage (V)"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 6 }}
                                />

                                <Line
                                    yAxisId="current"
                                    type="monotone"
                                    dataKey="current"
                                    name="Current (A)"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />

                                <Line
                                    yAxisId="percentage"
                                    type="monotone"
                                    dataKey="percentage"
                                    name="Battery (%)"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                        Chart shows the relationship between voltage, current, and battery charge level
                        {chartData.length === 0 && ' (Using sample data)'}
                    </p>
                </CardFooter>
            </Card>

            {/* Individual charts section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Voltage Chart */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Voltage Over Time</CardTitle>
                        <CardDescription>
                            {chartData.length > 0 ? 'Complete voltage history' : 'Sample voltage data'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {isLoadingChart ? (
                            <div className="h-full flex items-center justify-center">
                                <Skeleton className="h-[200px] w-full" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartDataWithFallback}
                                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="time" />
                                    <YAxis 
                                        domain={[10.5, 14]} 
                                        label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                                    />
                                    <Tooltip 
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
                                                        <p className="font-medium">{`Time: ${payload[0]?.payload?.formattedTime || label}`}</p>
                                                        <p className="text-blue-500">{`Voltage: ${payload[0]?.value}V`}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="voltage"
                                        name="Voltage"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Current Chart */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Current Draw</CardTitle>
                        <CardDescription>
                            {chartData.length > 0 ? 'Complete current consumption history' : 'Sample current data'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {isLoadingChart ? (
                            <div className="h-full flex items-center justify-center">
                                <Skeleton className="h-[200px] w-full" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartDataWithFallback}
                                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="time" />
                                    <YAxis 
                                        domain={[0, 5]} 
                                        label={{ value: 'Current (A)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                                    />
                                    <Tooltip 
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
                                                        <p className="font-medium">{`Time: ${payload[0]?.payload?.formattedTime || label}`}</p>
                                                        <p className="text-amber-500">{`Current: ${payload[0]?.value}A`}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="current"
                                        name="Current"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Battery Percentage Chart */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Battery Capacity</CardTitle>
                        <CardDescription>
                            {chartData.length > 0 ? 'Complete battery charge history' : 'Sample battery data'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {isLoadingChart ? (
                            <div className="h-full flex items-center justify-center">
                                <Skeleton className="h-[200px] w-full" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartDataWithFallback}
                                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="time" />
                                    <YAxis 
                                        domain={[0, 100]} 
                                        label={{ value: 'Capacity (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                                    />
                                    <Tooltip 
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
                                                        <p className="font-medium">{`Time: ${payload[0]?.payload?.formattedTime || label}`}</p>
                                                        <p className="text-green-500">{`Battery: ${payload[0]?.value}%`}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="percentage"
                                        name="Battery %"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 5 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Table with pagination */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Battery History Records</CardTitle>
                    <CardDescription>
                        Historical data for battery metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingHistory ? (
                        <div className="py-4">
                            <Skeleton className="h-10 w-full mb-2" />
                            <Skeleton className="h-10 w-full mb-2" />
                            <Skeleton className="h-10 w-full mb-2" />
                        </div>
                    ) : historyError ? (
                        <div className="py-10 text-center text-red-500">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                            <p>{historyError}</p>
                        </div>
                    ) : historyData.length === 0 ? (
                        <div className="py-10 text-center">
                            <p className="text-muted-foreground">No records found</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-2 text-left font-medium">Time</th>
                                        <th className="p-2 text-left font-medium">Voltage (V)</th>
                                        <th className="p-2 text-left font-medium">Current (A)</th>
                                        <th className="p-2 text-left font-medium">Battery (%)</th>
                                        <th className="p-2 text-left font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyData.map((record) => (
                                        <tr key={record._id} className="border-b">
                                            <td className="p-2">{new Date(record.timestamp).toLocaleString()}</td>
                                            <td className="p-2">{record.voltage.toFixed(1)}</td>
                                            <td className="p-2">{record.current.toFixed(1)}</td>
                                            <td className="p-2">{record.percentage}</td>
                                            <td className="p-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    record.status === 'Normal' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : record.status === 'Warning'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                        {historyData.length > 0 
                            ? `Showing page ${tableCurrentPage} of ${totalPages} (${historyData.length} records per page)` 
                            : 'No records to display'}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePageChange(tableCurrentPage - 1)}
                            disabled={tableCurrentPage <= 1 || isLoadingHistory}
                        >
                            Previous
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePageChange(tableCurrentPage + 1)}
                            disabled={tableCurrentPage >= totalPages || isLoadingHistory}
                        >
                            Next
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default BackupBattery