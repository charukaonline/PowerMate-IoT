import React, { useEffect, useState } from 'react';
import { motion } from "framer-motion";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Generator = () => {
    const [fuelLevel, setFuelLevel] = useState(0);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [temperature, setTemperature] = useState(null);
    const [humidity, setHumidity] = useState(null);
    const [isWarningDisplayed, setIsWarningDisplayed] = useState(false); 
    const [isStableDisplayed, setIsStableDisplayed] = useState(false);
    const generatorHeight = 100; // Maximum height
    const generatorCapacity = 500; // Capacity in liters
    const fuelConsumptionRate = 13; // Liters per hour

    useEffect(() => {

        const fetchRealTimeFuelData = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/distance");
                const { distance, timestamp } = response.data;

                const level = Math.max(0, generatorHeight - distance);
                setFuelLevel(level);

                setLastUpdate(new Date(timestamp).toLocaleString());

            } catch (error) {
                console.error("Error fetching fuel data:", error);
            }
        };

        const fetchTempAndHumidity = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/temperature");
                const { temperatureC, humidity } = response.data;
                setTemperature(temperatureC);
                setHumidity(humidity);

                // Check if temperature exceeds 100°C and display warning if not already shown
                if (temperatureC > 100 && !isWarningDisplayed) {
                    toast.error("Warning: The generator's temperature has exceeded safe limits.", {
                        position: "top-right",
                        autoClose: false,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                    setIsWarningDisplayed(true);
                }
                // If temperature drops below 100°C and warning was shown, display stable message and dismiss
                if (temperatureC <= 100 && isWarningDisplayed && !isStableDisplayed) {
                    toast.success("Temperature stable", {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                    setIsWarningDisplayed(false);
                    setIsStableDisplayed(true);

                    setTimeout(() => {
                        toast.dismiss();
                        setIsStableDisplayed(false);
                    }, 5000);
                }

            } catch (error) {
                console.error("Error fetching temperature and humidity:", error);
            }
        };

        fetchRealTimeFuelData();
        fetchTempAndHumidity();

        const intervalForFuel = setInterval(fetchRealTimeFuelData, 5000);
        const intervalForTemp = setInterval(fetchTempAndHumidity, 5000);

        return () => {
            clearInterval(intervalForFuel);
            clearInterval(intervalForTemp);
        };
    }, [isWarningDisplayed, isStableDisplayed]);

    // Convert to percentage
    const fuelPercentage = (fuelLevel / generatorHeight) * 100;

    // Calculate remaining liters
    const remainingLiters = (fuelLevel / generatorHeight) * generatorCapacity;

    // Calculate remaining time in hours
    const remainingTimeInHours = remainingLiters / fuelConsumptionRate;

    // Convert remaining time to hours and minutes
    const remainingHours = Math.floor(remainingTimeInHours);
    const remainingMinutes = Math.floor((remainingTimeInHours - remainingHours) * 60);

    let fuelColor = "bg-green-500";
    if (fuelPercentage <= 50 && fuelPercentage > 20) {
        fuelColor = "bg-yellow-500";
    } else if (fuelPercentage <= 20) {
        fuelColor = "bg-red-500";
    }

    let tempColor = temperature > 100 ? "bg-red-500" : "bg-blue-500";

    return (
        <div className='h-screen bg-[#121212] p-6'>
            <h1 className="text-3xl font-semibold mb-7 text-white">Generator Usage</h1>

            {lastUpdate && (
                <p className='text-base text-gray-400 mb-3'>
                    Last Updated: {lastUpdate}
                </p>
            )}

            <div className='flex space-x-2.5 w-full h-96'>
                <div className=' flex flex-col space-y-4'>
                    <div className="relative flex h-50 justify-center items-center text-white bg-black border-1 rounded-xl p-8">
                        <div>
                            <p className="text-xl text-white z-10">
                                Remaining Fuel: {remainingLiters.toFixed(1)} Liters
                            </p>

                            <p className="text-xl text-white z-10">
                                Remaining Time: {remainingHours}h {remainingMinutes}m
                            </p>
                        </div>
                    </div>

                    <div className={`relative flex h-50 justify-center items-center text-white border-1 rounded-xl p-8 ${tempColor}`}>
                        <div>
                            <p className="text-xl text-white z-10">
                                Temperature: {temperature !== null ? `${temperature}°C` : 'Loading...'}
                            </p>

                            <p className="text-xl text-white z-10">
                                Humidity: {humidity !== null ? `${humidity}%` : 'Loading...'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-col items-center justify-center text-white bg-black border-1 rounded-xl p-8">
                    <div className="relative w-80 h-80 bg-[#0d0d0d] border-4 border-gray-700 rounded-lg overflow-hidden z-10">
                        {/* Fuel Level Animation */}
                        <motion.div
                            className={`absolute bottom-0 w-full ${fuelColor}`}
                            animate={{ height: `${fuelPercentage}%` }}
                            transition={{ duration: 1 }}
                        />

                        {/* Fuel Level Text */}
                        <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold z-10">
                            {fuelPercentage.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
};

export default Generator;
