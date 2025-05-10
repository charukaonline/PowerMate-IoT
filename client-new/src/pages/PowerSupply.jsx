import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Battery, Zap, CircuitBoard, Activity, Gauge, Download } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

const PowerSupply = () => {
    // Sample data for the chart
    const [timeSeriesData, setTimeSeriesData] = useState([
        { time: '00:00', voltage: 11.2, current: 2.1 },
        { time: '02:00', voltage: 11.3, current: 2.3 },
        { time: '04:00', voltage: 11.1, current: 2.4 },
        { time: '06:00', voltage: 10.9, current: 2.7 },
        { time: '08:00', voltage: 10.8, current: 3.0 },
        { time: '10:00', voltage: 11.0, current: 2.8 },
        { time: '12:00', voltage: 11.2, current: 2.5 },
        { time: '14:00', voltage: 11.3, current: 2.4 },
        { time: '16:00', voltage: 11.1, current: 2.6 },
        { time: '18:00', voltage: 11.0, current: 2.9 },
        { time: '20:00', voltage: 10.9, current: 2.7 },
        { time: '22:00', voltage: 11.1, current: 2.3 },
    ]);

    // Sample records data for the table
    const [records, setRecords] = useState([
        { id: 1, deviceId: 'PM-2405', voltage: 11.2, current: 2.1, power: 23.5, timestamp: '2023-05-15 00:00:00' },
        { id: 2, deviceId: 'PM-2405', voltage: 11.3, current: 2.3, power: 26.0, timestamp: '2023-05-15 02:00:00' },
        { id: 3, deviceId: 'PM-2405', voltage: 11.1, current: 2.4, power: 26.6, timestamp: '2023-05-15 04:00:00' },
        { id: 4, deviceId: 'PM-2405', voltage: 10.9, current: 2.7, power: 29.4, timestamp: '2023-05-15 06:00:00' },
        { id: 5, deviceId: 'PM-2405', voltage: 10.8, current: 3.0, power: 32.4, timestamp: '2023-05-15 08:00:00' },
        { id: 6, deviceId: 'PM-2405', voltage: 11.0, current: 2.8, power: 30.8, timestamp: '2023-05-15 10:00:00' },
        { id: 7, deviceId: 'PM-2405', voltage: 11.2, current: 2.5, power: 28.0, timestamp: '2023-05-15 12:00:00' },
        { id: 8, deviceId: 'PM-2405', voltage: 11.3, current: 2.4, power: 27.1, timestamp: '2023-05-15 14:00:00' },
        { id: 9, deviceId: 'PM-2405', voltage: 11.1, current: 2.6, power: 28.9, timestamp: '2023-05-15 16:00:00' },
        { id: 10, deviceId: 'PM-2405', voltage: 11.0, current: 2.9, power: 31.9, timestamp: '2023-05-15 18:00:00' },
    ]);

    useEffect(() => {
        document.title = "Power Mate | Power Supply"
    }, [])

    // Custom tooltip formatter
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

    return (
        <div className="space-y-6">
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Voltage</CardTitle>
                        <CardDescription>Real-time voltage monitoring</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4 items-center justify-center'>
                        <div className='items-center justify-center text-center'>
                            <Battery className="h-10 w-10 text-primary mx-auto" />
                            <h1 className='text-xl font-bold mt-2'>11.0V</h1>
                        </div>
                        <Progress value={50} className="h-2" />
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
                            <h1 className='text-xl font-bold mt-2'>2.5A</h1>
                        </div>
                        <Progress value={60} className="h-2" />
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
                            <span className="flex items-center">PM-2405</span>

                            <Label className="text-muted-foreground flex items-center">Status:</Label>
                            <span className='text-green-500 font-medium flex items-center'>Online</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <h1 className="text-sm text-muted-foreground">Last updated: 2 minutes ago</h1>
                    </CardFooter>
                </Card>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Voltage and Current over time</CardTitle>
                    <CardDescription>24-hour monitoring data</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={timeSeriesData}
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
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-muted-foreground">Chart shows the relationship between voltage and current consumption</p>
                </CardFooter>
            </Card>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Power Consumption over time</CardTitle>
                    <CardDescription>24-hour power usage trend</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={timeSeriesData.map(entry => ({
                                ...entry,
                                power: (entry.voltage * entry.current).toFixed(1) // Calculate power (W) = voltage × current
                            }))}
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
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-muted-foreground">Average power: 28.3W | Peak power: 32.4W</p>
                </CardFooter>
            </Card>

            {/* Records Section */}
            <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Power Supply Records</CardTitle>
                        <CardDescription>Historical data of power supply measurements</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Record ID</TableHead>
                                    <TableHead>Device ID</TableHead>
                                    <TableHead>Voltage (V)</TableHead>
                                    <TableHead>Current (A)</TableHead>
                                    <TableHead>Power (W)</TableHead>
                                    <TableHead className="text-right">Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.id}</TableCell>
                                        <TableCell>{record.deviceId}</TableCell>
                                        <TableCell>{record.voltage.toFixed(1)}</TableCell>
                                        <TableCell>{record.current.toFixed(1)}</TableCell>
                                        <TableCell>{record.power.toFixed(1)}</TableCell>
                                        <TableCell className="text-right">{record.timestamp}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {records.length} of {records.length} records
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" disabled>
                            Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                            Next
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default PowerSupply