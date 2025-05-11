import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Battery, Zap, CircuitBoard, Activity, Gauge, Download, AlertCircle, BellElectric, Plug } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import useDCPowerStore from '@/store/dcPowerStore'

const PowerSupply = () => {
    const {
        currentData, isLoadingCurrent, currentError,
        historyData, isLoadingHistory, historyError,
        chartData, isLoadingChart, chartError,
        fetchCurrentData, fetchHistoryData, fetchChartData
    } = useDCPowerStore();

    const [deviceId, setDeviceId] = useState('PM-2405');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const recordsPerPage = 10;

    // Add filter state and options
    const [selectedFilter, setSelectedFilter] = useState('24h');

    const filterOptions = [
        { label: 'Last 24 Hours', value: '24h', days: 1 },
        { label: 'Last 7 Days', value: '7d', days: 7 },
        { label: 'Last Week', value: 'week', days: 7 },
        { label: 'Last Month', value: 'month', days: 30 },
    ];

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

    useEffect(() => {
        document.title = "Power Mate | Power Supply"

        fetchCurrentData();

        // Get date range based on selected filter
        const { startDate, endDate } = getDateRange(selectedFilter);

        fetchHistoryData({
            page: currentPage,
            limit: recordsPerPage,
            startDate,
            endDate
        });

        fetchChartData({
            deviceId,
            startDate,
            endDate
        });

        // Set up polling for real-time updates
        const intervalId = setInterval(() => {
            fetchCurrentData();
        }, 10000);

        return () => clearInterval(intervalId);
    }, [fetchCurrentData, fetchHistoryData, fetchChartData, currentPage, selectedFilter, deviceId]);

    useEffect(() => {
        if (historyData.length > 0) {
            const totalPagesFromAPI = useDCPowerStore.getState().totalPages;
            if (totalPagesFromAPI > 0) {
                setTotalPages(totalPagesFromAPI);
            }
        }
    }, [historyData]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Handle filter change
    const handleFilterChange = (filterValue) => {
        setSelectedFilter(filterValue);
        // Reset to first page when filter changes
        setCurrentPage(1);
    };

    const latestReading = currentData.length > 0 ? currentData[0] : null;

    const calculateVoltagePercentage = (voltage) => {
        if (!voltage) return 50;
        const min = 10.5;
        const max = 12.5;
        const percentage = ((voltage - min) / (max - min)) * 100;
        return Math.min(Math.max(percentage, 0), 100);
    }

    const calculateCurrentPercentage = (current) => {
        if (!current) return 60;
        const max = 4.2;
        const percentage = (current / max) * 100;
        return Math.min(percentage, 100);
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
                    <p className="font-medium">{`Time: ${label}`}</p>
                    <p className="text-primary">{`Voltage: ${payload[0].value}V`}</p>
                    <p className="text-amber-500">{`Current: ${payload[1].value}A`}</p>
                </div>
            );
        }
        return null;
    };

    const exportToCSV = () => {
        if (historyData.length === 0) return;

        const headers = ['Device ID', 'Voltage (V)', 'Current (A)', 'Power (W)', 'Timestamp'];
        const csvData = historyData.map(record => [
            record.deviceId,
            record.voltage,
            record.current,
            record.power,
            new Date(record.timestamp).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `power-supply-data-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {currentError && (
                <div className="bg-red-100 p-3 rounded-md border border-red-300 text-red-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>{currentError}</span>
                </div>
            )}

            {/* Add time period filter UI */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Power Supply Dashboard</h1>
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

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Voltage</CardTitle>
                        <CardDescription>Real-time voltage monitoring</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4 items-center justify-center'>
                        <div className='items-center justify-center text-center'>
                            <Plug className="h-10 w-10 text-primary mx-auto" />
                            <h1 className='text-xl font-bold mt-2'>
                                {isLoadingCurrent && !latestReading ? (
                                    <Skeleton className="h-6 w-16 mx-auto" />
                                ) : (
                                    `${latestReading?.voltage?.toFixed(1) || '11.0'}V`
                                )}
                            </h1>
                        </div>
                        <Progress
                            value={calculateVoltagePercentage(latestReading?.voltage)}
                            className="h-2"
                        />
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
                                    `${latestReading?.current?.toFixed(1) || '2.5'}A`
                                )}
                            </h1>
                        </div>
                        <Progress
                            value={calculateCurrentPercentage(latestReading?.current)}
                            className="h-2"
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <h1 className="text-sm text-muted-foreground">Peak current: 4.2A</h1>
                    </CardFooter>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Device Information</CardTitle>
                        <CardDescription>Connected power supply details</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-2'>
                        <div className='text-center mb-4'>
                            <CircuitBoard className="h-10 w-10 text-purple-500 mx-auto" />
                        </div>
                        <div className='grid grid-cols-2 gap-y-3 gap-x-2'>
                            <Label className="text-muted-foreground flex items-center">Device ID:</Label>
                            <span className="flex items-center">{latestReading?.deviceId || deviceId}</span>

                            <Label className="text-muted-foreground flex items-center">Status:</Label>
                            <span className={`font-medium flex items-center ${isLoadingCurrent ? 'text-amber-500' : currentError ? 'text-red-500' : 'text-green-500'}`}>
                                {isLoadingCurrent ? 'Connecting...' : currentError ? 'Offline' : 'Online'}
                            </span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <h1 className="text-sm text-muted-foreground">
                            Last updated: {latestReading ? new Date(latestReading.timestamp).toLocaleTimeString() : 'Never'}
                        </h1>
                    </CardFooter>
                </Card>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Voltage and Current over time</CardTitle>
                    <CardDescription>
                        {selectedFilter === '24h' ? '24-hour' :
                            selectedFilter === '7d' ? '7-day' :
                                selectedFilter === 'week' ? 'Weekly' : 'Monthly'} monitoring data
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    {isLoadingChart && chartData.length === 0 ? (
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
                                data={chartData.length > 0 ? chartData : [
                                    { time: '00:00', voltage: 11.2, current: 2.1 },
                                    { time: '06:00', voltage: 10.9, current: 2.7 },
                                    { time: '12:00', voltage: 11.2, current: 2.5 },
                                    { time: '18:00', voltage: 11.0, current: 2.9 },
                                ]}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.1} />
                                <XAxis dataKey="time" />
                                <YAxis yAxisId="left" orientation="left" stroke="#0ea5e9" domain={[10.5, 12]} />
                                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" domain={[0, 4]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="voltage"
                                    name="Voltage (V)"
                                    stroke="#0ea5e9"
                                    activeDot={{ r: 8 }}
                                    strokeWidth={2}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="current"
                                    name="Current (A)"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-muted-foreground">Chart shows the relationship between voltage and current consumption</p>
                </CardFooter>
            </Card>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Power Consumption over time</CardTitle>
                    <CardDescription>
                        {selectedFilter === '24h' ? '24-hour' :
                            selectedFilter === '7d' ? '7-day' :
                                selectedFilter === 'week' ? 'Weekly' : 'Monthly'} power usage trend
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    {isLoadingChart && chartData.length === 0 ? (
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
                                data={chartData.length > 0 ? chartData : [
                                    { time: '00:00', power: 23.5 },
                                    { time: '06:00', power: 29.4 },
                                    { time: '12:00', power: 28.0 },
                                    { time: '18:00', power: 31.9 },
                                ]}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.1} />
                                <XAxis dataKey="time" />
                                <YAxis
                                    yAxisId="power"
                                    domain={[20, 35]}
                                    label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
                                                    <p className="font-medium">{`Time: ${label}`}</p>
                                                    <p className="text-emerald-500">{`Power: ${payload[0]?.value}W`}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Line
                                    yAxisId="power"
                                    type="monotone"
                                    dataKey="power"
                                    name="Power (W)"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-muted-foreground">
                        {chartData.length > 0 ? (
                            `Average power: ${(chartData.reduce((sum, item) => sum + Number(item.power || 0), 0) / chartData.length).toFixed(1)}W | 
                            Peak power: ${Math.max(...chartData.map(item => Number(item.power || 0))).toFixed(1)}W`
                        ) : (
                            'Average power: 28.3W | Peak power: 32.4W'
                        )}
                    </p>
                </CardFooter>
            </Card>

            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Power Supply Records</CardTitle>
                        <CardDescription>
                            Historical data for the {selectedFilter === '24h' ? 'last 24 hours' :
                                selectedFilter === '7d' ? 'last 7 days' :
                                    selectedFilter === 'week' ? 'last week' : 'last month'}
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={exportToCSV}
                        disabled={historyData.length === 0 || isLoadingHistory}
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Device ID</TableHead>
                                        <TableHead>Voltage (V)</TableHead>
                                        <TableHead>Current (A)</TableHead>
                                        <TableHead>Power (W)</TableHead>
                                        <TableHead className="text-right">Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historyData.map((record, index) => (
                                        <TableRow key={record._id || index}>
                                            <TableCell>{record.deviceId}</TableCell>
                                            <TableCell>{record.voltage.toFixed(1)}</TableCell>
                                            <TableCell>{record.current.toFixed(1)}</TableCell>
                                            <TableCell>{record.power.toFixed(1)}</TableCell>
                                            <TableCell className="text-right">
                                                {new Date(record.timestamp).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                        {historyData.length > 0
                            ? `Showing page ${currentPage} of ${totalPages}`
                            : 'No records to display'}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1 || isLoadingHistory}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || isLoadingHistory}
                        >
                            Next
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default PowerSupply