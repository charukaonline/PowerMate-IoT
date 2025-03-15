import { Gauge as GaugeIcon, Thermometer, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
// import { Progress } from '@/components/ui/progress';
import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
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
  fuelLevelPercentage, 
  fuelVolume, 
  fuelLevelStatus, 
  oilTemperature 
} from '@/lib/mock-data';

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
} satisfies ChartConfig;



const GeneratorFuel = () => {
  // Generate mock data for fuel level history
  const generateFuelHistory = () => {
    const data = [];
    const now = new Date();
    const startLevel = fuelLevelPercentage + 15;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Simulate fuel consumption
      const level = Math.max(startLevel - (i * 0.5) - (Math.random() * 2), fuelLevelPercentage);
      
      data.push({
        date: date.toISOString().split('T')[0],
        level: Math.round(level),
      });
    }
    
    return data;
  };

  const fuelHistory = generateFuelHistory();

  // Generate mock data for oil temperature
  const generateTemperatureData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(time.getHours() - i);
      
      // Simulate temperature fluctuations
      const temp = oilTemperature + (Math.random() * 10 - 5);
      
      data.push({
        time: time.toISOString(),
        temperature: Math.round(temp * 10) / 10,
      });
    }
    
    return data;
  };

  const temperatureData = generateTemperatureData();
  const formattedTempData = temperatureData.map(item => ({
    time: new Date(item.time).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    value: item.temperature,
  }));

  // Calculate tank capacity based on current percentage and volume
  const tankCapacity = Math.round((fuelVolume / fuelLevelPercentage) * 100);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Generator Fuel</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Level</CardTitle>
            <GaugeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold">{fuelLevelPercentage}%</div>
            <StatusIndicator 
              status={fuelLevelStatus as "normal" | "warning" | "critical"} 
              label={fuelLevelStatus === "normal" ? "Normal" : fuelLevelStatus === "warning" ? "Warning" : "Critical"} 
            />
          </CardContent>
        </Card>
        <StatCard
          title="Fuel Volume"
          value={`${fuelVolume}L`}
          icon={<GaugeIcon />}
          description={`of ${tankCapacity}L capacity`}
        />
        <StatCard
          title="Estimated Runtime"
          value={`${Math.round(fuelLevelPercentage / 3.5)}h`}
          icon={<GaugeIcon />}
          description="At current consumption"
        />
        <StatCard
          title="Oil Temperature"
          value={`${oilTemperature}°C`}
          icon={<Thermometer />}
          description="Current reading"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
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
                  color={radialChartData[0].level> 30 ? "success" : "warning"}
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
            {/* <div className="w-full space-y-2 px-10">
              <div className="flex justify-between text-sm">
                <span>Empty</span>
                <span>Full</span>
              </div>
              <Progress value={fuelLevelPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0L</span>
                <span>{tankCapacity}L</span>
              </div>
            </div> */}
          <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Running up for 5h <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total fuel level in the generator
          </div>
        </CardFooter>
      </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oil Temperature (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedTempData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-5))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-5))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => value.split(':')[0]}
                  interval={Math.floor(formattedTempData.length / 10)}
                />
                <YAxis 
                  domain={[50, 80]} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}°C`}
                />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))' 
                  }}
                  labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                  formatter={(value) => [`${value}°C`, 'Temperature']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--chart-5))" 
                  fillOpacity={1} 
                  fill="url(#colorTemp)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fuel Level History (30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fuelHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => value.split('-')[2]}
                interval={Math.floor(fuelHistory.length / 20)}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))' 
                }}
                labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value) => [`${value}%`, 'Fuel Level']}
              />
              <Area 
                type="monotone" 
                dataKey="level" 
                stroke="hsl(var(--chart-4))" 
                fillOpacity={1} 
                fill="url(#colorFuel)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Fuel Status Thresholds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                  <span>Normal</span>
                </div>
                <span>&gt; 30%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-4"></div>
                  <span>Warning</span>
                </div>
                <span>15% - 30%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span>Critical</span>
                </div>
                <span>&lt; 15%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Temperature Thresholds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-2"></div>
                  <span>Normal</span>
                </div>
                <span>50°C - 70°C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-4"></div>
                  <span>Warning</span>
                </div>
                <span>70°C - 85°C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <span>Critical</span>
                </div>
                <span>&gt; 85°C</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Last Refueling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date:</span>
                <span>April 5, 2025</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span>120L</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Performed by:</span>
                <span>John Smith</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next scheduled:</span>
                <span>April 18, 2025</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeneratorFuel;