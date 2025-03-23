import {
  Activity,
  Battery,
  Clock,
  Gauge,
  Zap,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts';
import {
  powerConsumptionData,
  backupPowerStatus,
  generatorFuelLevel,
  powerDowntime,
  runtimeDistribution
} from '@/lib/mock-data';
import { useEffect } from 'react';

const radialChartData = [
  { name: "Fuel Level", level: 78, fill: "var(--color-safari)" },
]

const chartConfig = {
  visitors: {
    label: "Fuel Level",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

const Dashboard = () => {

  useEffect(() => {
    document.title = "PowerMate | Dashboard";
  }, []);

  // Format data for charts
  const chartData = powerConsumptionData.map((item) => ({
    time: new Date(item.time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    }),
    value: item.value,
  }));

  // Get the latest power consumption value
  const latestPowerConsumption = powerConsumptionData[powerConsumptionData.length - 1].value;

  // Colors for the pie chart
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Power Consumption"
          value={`${latestPowerConsumption}V`}
          icon={<Zap />}
          description="Current voltage"
          trend={{ value: 2.5, isPositive: true }}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backup Power</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{backupPowerStatus}</div>
            <StatusIndicator status="normal" label={"Online"} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generator Fuel</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{generatorFuelLevel}%</div>
            <StatusIndicator
              status={generatorFuelLevel > 30 ? "normal" : "warning"}
              label={generatorFuelLevel > 30 ? "Normal" : "Low"}
            />
          </CardContent>
        </Card>
        <StatCard
          title="Power Downtime"
          value={`${powerDowntime}h`}
          icon={<Activity />}
          description="Last 24 hours"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Power Consumption (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.split(':')[0]}
                  interval={Math.floor(chartData.length / 10)}
                />
                <YAxis
                  domain={[180, 250]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}V`}
                />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))'
                  }}
                  labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                  formatter={(value) => [`${value}V`, 'Voltage']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Runtime Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={runtimeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {runtimeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))'
                  }}
                  formatter={(value) => [`${value}%`, 'Runtime']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Generator Fuel Level</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <RadialBarChart
                data={radialChartData}
                startAngle={90}
                endAngle={378}
                innerRadius={80}
                outerRadius={110}
              >
                <PolarGrid
                  gridType="circle"
                  radialLines={false}
                  stroke="none"
                  className="first:fill-muted last:fill-background"
                  polarRadius={[86, 74]}
                  color={radialChartData[0].level > 30 ? "success" : "warning"}
                />
                <RadialBar dataKey="level" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-4xl font-bold"
                            >
                              {radialChartData[0].level.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Fuel Level
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Running up for 5h <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total fuel level in the generator
            </div>
          </CardFooter>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Power Downtime (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { day: 'Mon', hours: 0.5 },
                  { day: 'Tue', hours: 0 },
                  { day: 'Wed', hours: 1.2 },
                  { day: 'Thu', hours: 0.3 },
                  { day: 'Fri', hours: 0 },
                  { day: 'Sat', hours: 0.8 },
                  { day: 'Sun', hours: 2.5 },
                ]}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => `${value}h`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))'
                  }}
                  formatter={(value) => [`${value} hours`, 'Downtime']}
                />
                <Bar dataKey="hours" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;