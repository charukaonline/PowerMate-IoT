import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Battery, CircuitBoard, Thermometer } from 'lucide-react';
import React, { useEffect } from 'react'

const GeneratorFuel = () => {

    useEffect(() => {
        document.title = 'Power Mate | Generator Fuel'
    }, []);

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
                                {/* {isLoadingCurrent && !latestReading ? ( */}
                                <Skeleton className="h-6 w-16 mx-auto" />
                                {/* ) : (
                                    `${latestReading?.voltage?.toFixed(1) || '0.0'}V`
                                )} */}
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
                                {/* {isLoadingCurrent && !latestReading ? ( */}
                                <Skeleton className="h-6 w-16 mx-auto" />
                                {/* ) : (
                                    `${latestReading?.voltage?.toFixed(1) || '0.0'}V`
                                )} */}
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
                                {/* {isLoadingCurrent && !latestReading ? ( */}
                                <Skeleton className="h-6 w-16 mx-auto" />
                                {/* ) : (
                                    `${latestReading?.voltage?.toFixed(1) || '0.0'}V`
                                )} */}
                            </h1>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <h1 className="text-sm text-muted-foreground">
                            Last updated:
                        </h1>
                    </CardFooter>
                </Card>
            </div>

        </div>
    )
}

export default GeneratorFuel