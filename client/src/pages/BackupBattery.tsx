import { Battery, Zap, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { Progress } from '@/components/ui/progress';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { 
  batteryVoltageData, 
  batteryStatus, 
  batteryPower, 
  batteryTemperatureData, 
  chargingCycleStatus 
} from '@/lib/mock-data';

const BackupBattery = () => {
  // Format data for charts
  const formatChartData = (data: any[]) => {
    return data.map((item) => ({
      time: new Date(item.time).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      value: item.value,
    }));
  };

  const formattedVoltageData = formatChartData(batteryVoltageData);
  const formattedTempData = formatChartData(batteryTemperatureData);

  // Get the latest values
  const latestVoltage = batteryVoltageData[batteryVoltageData.length - 1].value;
  const latestTemp = batteryTemperatureData[batteryTemperatureData.length - 1].value;

  // Generate charging current data
  const generateChargingCurrentData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(time.getHours() - i);
      
      // Simulate charging/discharging current
      let current;
      if (batteryStatus === 'charging') {
        current = Math.random() * 3 + 1; // 1-4A for charging
      } else {
        current = -(Math.random() * 5 + 5); // -5 to -10A for discharging
      }
      
      data.push({
        time: time.toISOString(),
        current: Math.round(current * 10) / 10,
      });
    }
    
    return data;
  };

  const chargingCurrentData = generateChargingCurrentData();
  const formattedCurrentData = chargingCurrentData.map(item => ({
    time: new Date(item.time).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    value: item.current,
  }));

  // Calculate battery percentage based on voltage
  const calculateBatteryPercentage = (voltage: number) => {
    // Assuming 12V battery: 11.2V = 0%, 12.7V = 100%
    const minVoltage = 11.2;
    const maxVoltage = 12.7;
    const percentage = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
    return Math.min(Math.max(Math.round(percentage), 0), 100);
  };

  const batteryPercentage = calculateBatteryPercentage(latestVoltage);

  // Generate discharge time data
  const dischargeTimeData = [
    { name: 'Jan', hours: 3.2 },
    { name: 'Feb', hours: 4.1 },
    { name: 'Mar', hours: 2.8 },
    { name: 'Apr', hours: chargingCycleStatus.dischargeTime },
    { name: 'May', hours: 0 },
    { name: 'Jun', hours: 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Backup Battery</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Battery Voltage"
          value={`${latestVoltage}V`}
          icon={<Battery />}
          description="Current reading"
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Battery Status</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold capitalize">{batteryStatus}</div>
            <StatusIndicator 
              status={batteryStatus === "charging" ? "normal" : "warning"} 
              label={batteryStatus === "charging" ? "Charging" : "Discharging"} 
            />
          </CardContent>
        </Card>
        <StatCard
          title="Battery Power"
          value={`${batteryPower}V`}
          icon={<Zap />}
          description={`${batteryPercentage}% capacity`}
        />
        <StatCard
          title="Battery Temperature"
          value={`${latestTemp}°C`}
          icon={<Thermometer />}
          description="Current reading"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Battery Voltage (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedVoltageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => value.split(':')[0]}
                  interval={Math.floor(formattedVoltageData.length / 10)}
                />
                <YAxis 
                  domain={[11, 14]} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}V`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))' 
                  }}
                  labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                  formatter={(value) => [`${value}V`, 'Voltage']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charging Current (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedCurrentData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => value.split(':')[0]}
                   interval={Math.floor(formattedCurrentData.length / 10)}
                />
                <YAxis 
                  domain={[-10, 5]} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}A`}
                />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))' 
                  }}
                  labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                  formatter={(value) => [
                    `${value}A`, 
                    Number(value) >= 0 ? 'Charging Current' : 'Discharging Current'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={batteryStatus === 'charging' ? "hsl(var(--chart-2))" : "hsl(var(--chart-4))"}
                  fillOpacity={1} 
                  fill={batteryStatus === 'charging' ? "url(#colorPositive)" : "url(#colorNegative)"}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Battery Temperature (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedTempData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => value.split(':')[0]}
                   interval={Math.floor(formattedTempData.length / 10)}
                />
                <YAxis 
                  domain={[20, 50]} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}°C`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))' 
                  }}
                  labelStyle={{ color: 'hsl(var(--card-foreground))' }}
                  formatter={(value) => [`${value}°C`, 'Temperature']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--chart-5))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discharge Time (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dischargeTimeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}h`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))' 
                  }}
                  formatter={(value) => [`${value} hours`, 'Discharge Time']}
                />
                <Bar dataKey="hours" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Battery Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>0%</span>
                <span>{batteryPercentage}%</span>
                <span>100%</span>
              </div>
              <Progress value={batteryPercentage} className="h-3" />
              <div className="grid grid-cols-3 text-xs text-muted-foreground mt-1">
                <div>11.2V</div>
                <div className="text-center">{latestVoltage}V</div>
                <div className="text-right">12.7V</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Charging Cycle Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Cycles:</span>
                <span>{chargingCycleStatus.cycleCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Wasted Cycles:</span>
                <span>{chargingCycleStatus.wastedCycles}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Efficiency:</span>
                <span>{Math.round((1 - chargingCycleStatus.wastedCycles / chargingCycleStatus.cycleCount) * 100)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Discharge Time:</span>
                <span>{chargingCycleStatus.dischargeTime}h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Battery Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Health Status:</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-chart-2 mr-2"></div>
                  <span>Good</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Life:</span>
                <span>18 months</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Replaced:</span>
                <span>Oct 12, 2024</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Maintenance:</span>
                <span>Apr 12, 2026</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackupBattery;