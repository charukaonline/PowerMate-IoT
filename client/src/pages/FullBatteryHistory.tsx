import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface FullBatteryData {
    _id: string;
    deviceId: string;
    voltage: number;
    current: number;
    percentage: number;
    timestamp: string;
}

export default function FullBatteryHistory() {
    const [data, setData] = useState<FullBatteryData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5000/api/full-battery-history/88:13:BF:0C:3B:6C"
                );
                setData(response.data); // ✅ API returns an array directly
                setError(null);
            } catch (err) {
                setError("Failed to fetch full battery history data.");
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <Card className="shadow-lg dark:bg-zinc-900">
                <CardHeader>
                    <CardTitle className="text-xl text-green-600">Full Battery History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableCaption className="text-muted-foreground">
                            Battery statistics for device <code>88:13:BF:0C:3B:6C</code>
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Device ID</TableHead>
                                <TableHead>Voltage (V)</TableHead>
                                <TableHead>Current (A)</TableHead>
                                <TableHead>Percentage (%)</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>{item.deviceId}</TableCell>
                                    <TableCell>{item.voltage.toFixed(2)}</TableCell>
                                    <TableCell>{item.current.toFixed(2)}</TableCell>
                                    <TableCell>{item.percentage}%</TableCell>
                                    <TableCell>{format(new Date(item.timestamp), "PPpp")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
