import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Battery, CircuitBoard, Thermometer } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer,
    Area,
    AreaChart 
} from 'recharts';
import useGeneratorFuelStore from '@/store/generatorFuelStore';

const GeneratorFuel = () => {
    // Use the combined store for both fuel and temperature data
    const { 
        temperature, tempLoading, tempError, fetchTemperature,
        fuelHistory, fuelLoading, fuelError, fetchFuelHistory 
    } = useGeneratorFuelStore();
    
    const [deviceId, setDeviceId] = useState("08:A6:F7:B1:C9:A0"); // default device ID
    
    useEffect(() => {
        document.title = 'Power Mate | Generator Fuel';
        
        // Fetch initial data
        fetchTemperature(deviceId);
        fetchFuelHistory({ limit: 100 }); // Pass deviceId to ensure it works
        fetchFuelHistory({ limit: 7 }); // Last 7 records for the chart
        
        // Set up polling intervals
        const tempInterval = setInterval(() => fetchTemperature(deviceId), 60000); // every minute
        const fuelInterval = setInterval(() => fetchFuelHistory({ deviceId, limit: 100 }), 300000); // every 5 minutes
        
        return () => {
            clearInterval(tempInterval);
            clearInterval(fuelInterval);
        };
    }, [deviceId]);

    const formatTimeString = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    };

    return (
        <div className=' space-y-6'>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-2xl font-bold">Backup Battery Dashboard</h1>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Fuel Level</CardTitle>
                        <CardDescription>Real-time fuel level monitoring</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4 items-center justify-center'>
                        <div className='items-center justify-center text-center'>
                            <Battery className="h-10 w-10 text-primary mx-auto" />
                            <h1 className='text-xl font-bold mt-2'>
                                {fuelLoading ? (
                                    <Skeleton className="h-6 w-16 mx-auto" />
                                ) : fuelHistory.length > 0 ? (
                                    `${fuelHistory[0].level}%`
                                ) : (
                                    'No data'
                                )}
                            </h1>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <h1 className="text-sm text-muted-foreground">Generator Capacity: 125L</h1>
                    </CardFooter>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Temperature</CardTitle>
                        <CardDescription>Real-time temperature monitoring</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4 items-center justify-center'>
                        <div className='items-center justify-center text-center'>
                            <Thermometer className="h-10 w-10 text-red-500 mx-auto" />
                            <h1 className='text-xl font-bold mt-2'>
                                {tempLoading ? (
                                    <Skeleton className="h-6 w-16 mx-auto" />
                                ) : temperature ? (
                                    `${temperature.temperatureC}°C (${temperature.temperatureF}°F)`
                                ) : (
                                    'No data'
                                )}
                            </h1>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <h1 className="text-sm text-muted-foreground">Normal temperature: 30°C</h1>
                    </CardFooter>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Device Information</CardTitle>
                        <CardDescription>Connected power supply details</CardDescription>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4 items-center justify-center'>
                        <div className='items-center justify-center text-center'>
                            <CircuitBoard className="h-10 w-10 text-purple-500 mx-auto" />
                            <h1 className='text-xl font-bold mt-2'>
                                {tempLoading ? (
                                    <Skeleton className="h-6 w-16 mx-auto" />
                                ) : temperature ? (
                                    temperature.deviceId
                                ) : (
                                    'Not connected'
                                )}
                            </h1>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <h1 className="text-sm text-muted-foreground">
                            Last updated: {temperature ? formatTimeString(temperature.timestamp) : 'N/A'}
                        </h1>
                    </CardFooter>
                </Card>
            </div>

            {/* Fuel Level Chart */}
            <Card className="w-full mt-6">
                <CardHeader>
                    <CardTitle>Fuel Level History</CardTitle>
                    <CardDescription>Historical fuel level data over time</CardDescription>
                </CardHeader>
                <CardContent className="w-full h-[400px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={fuelHistory}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <defs>
                                <linearGradient id="colorFuelLevel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="time" />
                            <YAxis 
                                domain={[0, 100]} 
                                label={{ value: 'Fuel Level (%)', angle: -90, position: 'insideLeft' }} 
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--card))', 
                                    borderColor: 'hsl(var(--border))' 
                                }}
                                formatter={(value) => [`${value}%`, 'Fuel Level']}
                                labelFormatter={(label) => `Time: ${label}`}
                            />
                            <Legend />
                            <Area 
                                type="monotone" 
                                dataKey="level" 
                                name="Fuel Level"
                                stroke="#3b82f6" 
                                fillOpacity={1} 
                                fill="url(#colorFuelLevel)"
                                activeDot={{ r: 8 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
                <CardFooter>
                    <p className="text-sm text-muted-foreground">
                        Data updates every hour. Last updated: {fuelHistory.length > 0 ? `${fuelHistory[0].date} at ${fuelHistory[0].time}` : 'N/A'}
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default GeneratorFuel