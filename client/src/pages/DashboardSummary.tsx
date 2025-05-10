"use client";

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {
    Battery,
    Zap,
    Droplet,
    BarChart,
    TrendingDown,
    Database,
    Fuel,
    BatteryCharging,
    History,
    ChevronUp,
    ChevronDown,
    Percent
} from 'lucide-react'
import { StatCard } from '@/pages/Dash-statcard.tsx'
import { Meteors } from '@/components/magicui/meteors'
import { AnimatedList } from '@/components/magicui/animated-list'

interface FuelLevelResponse {
    success: boolean
    data: {
        deviceId: string
        rawDistance: number
        fuelLevelPercentage: number
        timestamp: string
    }
}

interface BatteryHistoryEntry {
    _id: string
    deviceId: string
    voltage: number
    current: number
    percentage: number
    timestamp: string
}

export function DashboardSummary() {
    const deviceId = '88:13:BF:0C:3B:6C'
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // current snapshot
    const [rawDistance, setRawDistance] = useState(0)
    const [fuelPct, setFuelPct] = useState(0)
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)

    // history stats
    const [historyCount, setHistoryCount] = useState(0)
    const [latestVoltage, setLatestVoltage] = useState(0)
    const [latestCurrent, setLatestCurrent] = useState(0)
    const [latestBatteryPct, setLatestBatteryPct] = useState(0)
    const [avgVoltage, setAvgVoltage] = useState(0)
    const [maxVoltage, setMaxVoltage] = useState(0)
    const [minVoltage, setMinVoltage] = useState(0)
    const [voltageStatus, setVoltageStatus] = useState<'stable' | 'rising' | 'falling'>('stable')

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            setError(null)

            try {
                const curRes = await axios.get<FuelLevelResponse>(
                    `http://localhost:5000/api/fuel-level/${encodeURIComponent(deviceId)}`
                )
                const cur = curRes.data.data
                setRawDistance(cur.rawDistance)
                setFuelPct(cur.fuelLevelPercentage)
                setLastUpdated(new Date(cur.timestamp).toLocaleTimeString())

                const arr = await axios
                    .get<BatteryHistoryEntry[]>(
                        `http://localhost:5000/api/full-battery-history/${encodeURIComponent(deviceId)}`
                    )
                    .then((r) => r.data)

                setHistoryCount(arr.length)

                if (arr.length > 0) {
                    const latest = arr[0]
                    setLatestVoltage(latest.voltage)
                    setLatestCurrent(latest.current)
                    setLatestBatteryPct(latest.percentage)

                    const volts = arr.map((d) => d.voltage)
                    const sum = volts.reduce((s, v) => s + v, 0)
                    setAvgVoltage(sum / volts.length)
                    setMaxVoltage(Math.max(...volts))
                    setMinVoltage(Math.min(...volts))

                    // Determine voltage trend
                    if (arr.length >= 2) {
                        const prevVoltage = arr[1].voltage
                        if (latest.voltage > prevVoltage + 0.1) {
                            setVoltageStatus('rising')
                        } else if (latest.voltage < prevVoltage - 0.1) {
                            setVoltageStatus('falling')
                        } else {
                            setVoltageStatus('stable')
                        }
                    }
                }
            } catch (e: any) {
                console.error(e)
                setError('Failed to load dashboard data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [deviceId])

    if (loading) {
        return <div className="flex items-center justify-center h-48">Loading summary…</div>
    }
    if (error) {
        return <div className="text-red-600 p-4 text-center">{error}</div>
    }

    // Get appropriate color classes for fuel level
    const getFuelColorClass = () => {
        if (fuelPct > 70) return "text-green-500"
        if (fuelPct > 30) return "text-yellow-500"
        return "text-red-500"
    }

    const getFuelFillColor = () => {
        if (fuelPct > 70) return "bg-green-500/20 border-green-500/50"
        if (fuelPct > 30) return "bg-yellow-500/20 border-yellow-500/50"
        return "bg-red-500/20 border-red-500/50"
    }

    // Get appropriate color classes for battery level
    const getBatteryColorClass = () => {
        if (latestBatteryPct > 70) return "text-green-500"
        if (latestBatteryPct > 20) return "text-yellow-500"
        return "text-red-500"
    }

    const getBatteryFillColor = () => {
        if (latestBatteryPct > 70) return "bg-green-500/20 border-green-500/50"
        if (latestBatteryPct > 20) return "bg-yellow-500/20 border-yellow-500/50"
        return "bg-red-500/20 border-red-500/50"
    }

    // Get voltage trend icon
    const getVoltageIcon = () => {
        if (voltageStatus === 'rising') return <ChevronUp className="text-green-500" />
        if (voltageStatus === 'falling') return <ChevronDown className="text-red-500" />
        return null
    }

    // Get color classes for current
    const getCurrentColor = () => {
        if (latestCurrent > 1) return "bg-blue-500/20 border-blue-500/50"
        if (latestCurrent > 0) return "bg-green-500/20 border-green-500/50"
        return "bg-gray-500/20 border-gray-500/50"
    }

    // Get color classes for voltage
    const getVoltageColor = () => {
        if (voltageStatus === 'rising') return "bg-green-500/20 border-green-500/50"
        if (voltageStatus === 'falling') return "bg-red-500/20 border-red-500/50"
        return "bg-blue-500/20 border-blue-500/50"
    }

    // Get normalized values for visual indicators
    const normalizeValue = (value: number, min: number, max: number) => {
        return ((value - min) / (max - min)) * 100
    }

    // Calculate normalized voltage percentage for visual indicator
    const voltageNormalized = normalizeValue(latestVoltage, 3.0, 4.2)

    // Calculate normalized current percentage (assuming -1A to 2A range)
    const currentNormalized = normalizeValue(latestCurrent, -1, 2)

    // Organize cards into logical groups
    const fuelCards = [
        {
            title: 'Fuel Level',
            value: `${fuelPct.toFixed(1)}%`,
            icon: <Fuel className={getFuelColorClass()} />,
            description: 'Current tank capacity',
            highlight: true,
            footer: lastUpdated ? `Updated at ${lastUpdated}` : undefined,
            progress: {
                value: fuelPct,
                max: 100,
                color: getFuelFillColor()
            }
        },
        {
            title: 'Raw Distance',
            value: `${rawDistance.toFixed(2)} cm`,
            icon: <BarChart />,
            description: 'Ultrasonic sensor reading',
            progress: {
                value: normalizeValue(rawDistance, 0, 20),
                max: 100,
                color: "bg-blue-500/20 border-blue-500/50"
            }
        },
    ]

    const batteryCards = [
        {
            title: 'Battery Status',
            value: `${latestBatteryPct.toFixed(0)}%`,
            icon: <Battery className={getBatteryColorClass()} />,
            description: 'Current capacity',
            highlight: true,
            progress: {
                value: latestBatteryPct,
                max: 100,
                color: getBatteryFillColor()
            }
        },
        {
            title: 'Voltage',
            value: (
                <div className="flex items-center gap-1">
                    {latestVoltage.toFixed(2)} V
                    {getVoltageIcon()}
                </div>
            ),
            icon: <Zap />,
            description: latestCurrent > 0 ? 'Charging' : 'Discharging',
            progress: {
                value: voltageNormalized,
                max: 100,
                color: getVoltageColor()
            }
        },
        {
            title: 'Current',
            value: `${latestCurrent.toFixed(2)} A`,
            icon: <BatteryCharging />,
            description: latestCurrent > 0 ? 'Power input' : 'Power draw',
            progress: {
                value: currentNormalized,
                max: 100,
                color: getCurrentColor()
            }
        },
    ]

    const historyCards = [
        {
            title: 'Data Points',
            value: historyCount.toLocaleString(),
            icon: <Database />,
            description: 'Total readings collected',
            progress: {
                value: Math.min(historyCount / 10, 100), // Fill based on data points, max at 1000
                max: 100,
                color: "bg-purple-500/20 border-purple-500/50"
            }
        },
        {
            title: 'Voltage Range',
            value: (
                <div className="flex flex-col">
                    <span className="text-sm font-normal text-slate-500">Avg: {avgVoltage.toFixed(2)} V</span>
                    <span className="text-xs text-slate-400">Min: {minVoltage.toFixed(2)} V / Max: {maxVoltage.toFixed(2)} V</span>
                </div>
            ),
            icon: <History />,
            description: 'Based on Historical voltage data',
            progress: {
                value: normalizeValue(avgVoltage, minVoltage, maxVoltage),
                max: 100,
                color: "bg-indigo-500/20 border-indigo-500/50"
            }
        },
    ]

    return (
        <div className="relative w-full h-full">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">System Dashboard</h1>
                {lastUpdated && (
                    <div className="text-sm text-slate-500">Last updated: {lastUpdated}</div>
                )}
            </div>

            {/* Meteor shower background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50">
                <Meteors
                    number={15}
                    minDelay={0.2}
                    maxDelay={2}
                    minDuration={3}
                    maxDuration={8}
                    angle={220}
                />
            </div>

            {/* Dashboard content */}
            <div className="relative z-10 space-y-8">
                {/* Fuel section */}
                <section>
                    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Droplet className="h-5 w-5" />
                        Fuel Monitoring
                    </h2>
                    <AnimatedList delay={100}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {fuelCards.map((card, i) => (
                                <StatCard
                                    key={i}
                                    title={card.title}
                                    value={card.value}
                                    icon={card.icon}
                                    description={card.description}
                                    highlight={card.highlight}
                                    footer={card.footer}
                                    progress={card.progress}
                                    className="h-40" // Fixed height for consistent liquid fill
                                />
                            ))}
                        </div>
                    </AnimatedList>
                </section>

                {/* Battery section */}
                <section>
                    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <BatteryCharging className="h-5 w-5" />
                        Power & Battery
                    </h2>
                    <AnimatedList delay={150}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {batteryCards.map((card, i) => (
                                <StatCard
                                    key={i}
                                    title={card.title}
                                    value={card.value}
                                    icon={card.icon}
                                    description={card.description}
                                    highlight={card.highlight}
                                    progress={card.progress}
                                    className="h-40" // Fixed height for consistent liquid fill
                                />
                            ))}
                        </div>
                    </AnimatedList>
                </section>

                {/* History section */}
                <section>
                    <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Historical Data
                    </h2>
                    <AnimatedList delay={200}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {historyCards.map((card, i) => (
                                <StatCard
                                    key={i}
                                    title={card.title}
                                    value={card.value}
                                    icon={card.icon}
                                    description={card.description}
                                    className="h-40" // Fixed height for consistent liquid fill
                                />
                            ))}
                        </div>
                    </AnimatedList>
                </section>
            </div>
        </div>
    )
}