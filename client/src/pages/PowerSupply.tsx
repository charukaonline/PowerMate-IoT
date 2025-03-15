import { Zap, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
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
  voltageData, 
  frequencyData, 
  minVoltageData, 
  maxVoltageData, 
  voltageStatus 
} from '@/lib/mock-data';

const PowerSupply = () => {
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

  const formattedVoltageData = formatChartData(voltageData);
  const formattedFrequencyData = formatChartData(frequencyData);
  const formattedMinVoltageData = formatChartData(minVoltageData);
  const formattedMaxVoltageData = formatChartData(maxVoltageData);

  // Get the latest values
  const latestVoltage = voltageData[voltageData.length - 1].value;
  const latestFrequency = frequencyData[frequencyData.length - 1].value;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Power Supply</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="AC Voltage"
          value={`${latestVoltage}V`}
          icon={<Zap />}
          description="Current reading"
        />
        <StatCard
          title="Power Frequency"
          value={`${latestFrequency}Hz`}
          icon={<Activity />}
          description="Current reading"
        />
        <StatCard
          title="Min Voltage (24h)"
          value={`${voltageStatus.min}V`}
          icon={<Zap />}
          description="Last 24 hours"
        />
        <StatCard
          title="Max Voltage (24h)"
          value={`${voltageStatus.max}V`}
          icon={<Zap />}
          description="Last 24 hours"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>AC/DC Voltage (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedVoltageData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => value.split(':')[0]}
                  interval={Math.floor(formattedFrequencyData.length / 14)}
                />
                <YAxis 
                  domain={[200, 250]} 
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
                  stroke="hsl(var(--chart-2))" 
                  fillOpacity={1} 
                  fill="url(#colorVoltage)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Power Frequency (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedFrequencyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }} 
                  tickFormatter={(value) => value.split(':')[0]}
                  interval={Math.floor(formattedFrequencyData.length / 10)}
                />
                <YAxis 
                  domain={[48, 52]} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}Hz`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))' 
                  }}
                  formatter={(value) => [`${value}Hz`, 'Frequency']}
                />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voltage Range (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  allowDuplicatedCategory={false}
                  tickFormatter={(value) => value.split(':')[0]}
                  interval={Math.floor(formattedFrequencyData.length / 10)}
                />
                <YAxis 
                  domain={[200, 250]} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}V`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))' 
                  }}
                  formatter={(value) => [`${value}V`, 'Voltage']}
                />
                <Line 
                  data={formattedMinVoltageData} 
                  type="monotone" 
                  dataKey="value" 
                  name="Min Voltage"
                  stroke="hsl(var(--chart-3))" 
                  dot={false}
                />
                <Line 
                  data={formattedMaxVoltageData} 
                  type="monotone" 
                  dataKey="value" 
                  name="Max Voltage"
                  stroke="hsl(var(--chart-1))" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voltage Status (2h Interval)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Time</th>
                  <th className="text-left py-3 px-4">Min (V)</th>
                  <th className="text-left py-3 px-4">Max (V)</th>
                  <th className="text-left py-3 px-4">Average (V)</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(12)].map((_, i) => {
                  const hour = new Date();
                  hour.setHours(hour.getHours() - (i * 2));
                  const timeStr = hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  const min = voltageStatus.min - randomVariation(5);
                  const max = voltageStatus.max + randomVariation(5);
                  const avg = Math.floor((min + max) / 2);
                  
                  const status = getVoltageStatus(min, max);
                  
                  return (
                    <tr key={i} className="border-b">
                      <td className="py-3 px-4">{timeStr}</td>
                      <td className="py-3 px-4">{min}</td>
                      <td className="py-3 px-4">{max}</td>
                      <td className="py-3 px-4">{avg}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            status === 'normal' ? 'bg-chart-2' : 
                            status === 'warning' ? 'bg-chart-4' : 
                            'bg-destructive'
                          }`}></div>
                          <span className="capitalize">{status}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
const randomVariation = (max: number) => Math.floor(Math.random() * max);

const getVoltageStatus = (min: number, max: number) => {
  if (min < 205 || max > 245) return 'critical';
  if (min < 210 || max > 240) return 'warning';
  return 'normal';
};

export default PowerSupply;