import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Battery, Clock, Percent, Zap } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const BackupBattery = () => {

    const [selectedFilter, setSelectedFilter] = useState('24h');
    const [isLoading, setIsLoading] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [tableData, setTableData] = useState([]);
    const recordsPerPage = 10;

    const filterOptions = [
        { label: 'Last 24 Hours', value: '24h', days: 1 },
        { label: 'Last 7 Days', value: '7d', days: 7 },
        { label: 'Last Week', value: 'week', days: 7 },
        { label: 'Last Month', value: 'month', days: 30 },
    ];

    // Function to handle filter change
    const handleFilterChange = (filterValue) => {
        setSelectedFilter(filterValue);
        fetchData(filterValue);
    };

    // Sample function to fetch data - replace with actual API call
    const fetchData = (filterValue) => {
        setIsLoading(true);

        // Simulate API call with setTimeout
        setTimeout(() => {
            const sampleData = generateSampleData(filterValue);
            setChartData(sampleData);
            setIsLoading(false);
        }, 1000);
    };

    // Generate sample data based on selected filter
    const generateSampleData = (filterValue) => {
        const data = [];
        const filter = filterOptions.find(opt => opt.value === filterValue);
        const points = filter.value === '24h' ? 24 : filter.value === '7d' ? 7 : 30;

        for (let i = 0; i < points; i++) {
            const baseVoltage = 11 + Math.random() * 1.5;
            const baseCurrent = 2 + Math.random() * 2;
            const basePercentage = 50 + Math.random() * 50;

            data.push({
                time: filter.value === '24h'
                    ? `${i}:00`
                    : `Day ${i + 1}`,
                voltage: baseVoltage.toFixed(1),
                current: baseCurrent.toFixed(1),
                percentage: Math.round(basePercentage)
            });
        }

        // Generate more data for the table (50 records in total)
        const tableDataSet = [];
        for (let i = 0; i < 50; i++) {
            const baseVoltage = 11 + Math.random() * 1.5;
            const baseCurrent = 2 + Math.random() * 2;
            const basePercentage = Math.round(10 + Math.random() * 90); // Generate from 10% to 100%
            
            // Determine status based on battery percentage
            let status;
            if (basePercentage < 20) {
                status = 'Critical'; // Critical for very low battery
            } else if (basePercentage < 40) {
                status = 'Warning'; // Warning for low battery
            } else {
                status = 'Normal'; // Normal for adequate battery levels
            }
            
            tableDataSet.push({
                id: i + 1,
                time: new Date(Date.now() - i * 3600000).toLocaleString(),
                voltage: baseVoltage.toFixed(1),
                current: baseCurrent.toFixed(1),
                percentage: basePercentage,
                status: status
            });
        }
        
        // Set table data and calculate total pages
        setTableData(tableDataSet);
        setTotalPages(Math.ceil(tableDataSet.length / recordsPerPage));
        
        return data;
    };

    // Add function to handle page changes
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Get current records for the table based on pagination
    const getCurrentRecords = () => {
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        return tableData.slice(startIndex, endIndex);
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

    // Initialize data on component mount
    useEffect(() => {
        fetchData(selectedFilter);
    }, []);

    return (
        <div className="space-y-6">

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
                                <Skeleton className="h-6 w-16 mx-auto" />
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
                                <Skeleton className="h-6 w-16 mx-auto" />
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
                            <Percent className="h-10 w-10 text-amber-500 mx-auto" />
                            <h1 className='text-xl font-bold mt-2'>
                                <Skeleton className="h-6 w-16 mx-auto" />
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
                                <Skeleton className="h-6 w-16 mx-auto" />
                            </h1>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <h1 className="text-sm text-muted-foreground">Last Update: 5/9/2025, 18:00:00</h1>
                    </CardFooter>
                </Card>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Battery Metrics Over Time</CardTitle>
                    <CardDescription>
                        {selectedFilter === '24h' ? '24-hour' :
                            selectedFilter === '7d' ? '7-day' :
                                selectedFilter === 'week' ? 'Weekly' : 'Monthly'} battery performance
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Skeleton className="h-4 w-32 mx-auto mb-2" />
                                <Skeleton className="h-[300px] w-full" />
                            </div>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="time" />

                                <YAxis
                                    yAxisId="voltage"
                                    orientation="left"
                                    stroke="#3b82f6"
                                    domain={[10.5, 12.5]}
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
                            Battery voltage trends
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Skeleton className="h-[200px] w-full" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="time" />
                                    <YAxis 
                                        domain={[10.5, 12.5]} 
                                        label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                                    />
                                    <Tooltip 
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-background border rounded-md shadow-sm p-2 text-sm">
                                                        <p className="font-medium">{`Time: ${label}`}</p>
                                                        <p className="text-blue-500">{`Voltage: ${payload[0].value}V`}</p>
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
                                        dot={{ r: 2 }}
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
                            Battery current consumption
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Skeleton className="h-[200px] w-full" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
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
                                                        <p className="font-medium">{`Time: ${label}`}</p>
                                                        <p className="text-amber-500">{`Current: ${payload[0].value}A`}</p>
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
                                        dot={{ r: 2 }}
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
                            Battery charge percentage 
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                        {isLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <Skeleton className="h-[200px] w-full" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
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
                                                        <p className="font-medium">{`Time: ${label}`}</p>
                                                        <p className="text-green-500">{`Battery: ${payload[0].value}%`}</p>
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
                                        dot={{ r: 2 }}
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
                    {isLoading ? (
                        <div className="py-4">
                            <Skeleton className="h-10 w-full mb-2" />
                            <Skeleton className="h-10 w-full mb-2" />
                            <Skeleton className="h-10 w-full mb-2" />
                        </div>
                    ) : tableData.length === 0 ? (
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
                                    {getCurrentRecords().map((record) => (
                                        <tr key={record.id} className="border-b">
                                            <td className="p-2">{record.time}</td>
                                            <td className="p-2">{record.voltage}</td>
                                            <td className="p-2">{record.current}</td>
                                            <td className="p-2">{record.percentage}</td>
                                            <td className="p-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    record.status === 'Normal' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : record.status === 'Warning'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-red-100 text-red-800' // For Critical status
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
                        {tableData.length > 0 
                            ? `Showing page ${currentPage} of ${totalPages} (${tableData.length} records)` 
                            : 'No records to display'}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages || isLoading}
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