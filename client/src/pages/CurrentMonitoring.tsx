import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  currentData,
  minCurrentData,
  maxCurrentData,
  currentStatus,
} from "@/lib/mock-data";

const CurrentMonitoring = () => {
  // Format data for charts
  const formatChartData = (data: any[]) => {
    return data.map((item) => ({
      time: new Date(item.time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: item.value,
    }));
  };

  const formattedCurrentData = formatChartData(currentData);

  // Get the latest values
  const latestCurrent = currentData[currentData.length - 1].value;
  const minCurrent = Math.min(...minCurrentData.map((item) => item.value));
  const maxCurrent = Math.max(...maxCurrentData.map((item) => item.value));

  // Prepare min/max current data for bar chart
  const minMaxCurrentData = [
    { name: "00:00", min: 10, max: 28 },
    { name: "04:00", min: 8, max: 25 },
    { name: "08:00", min: 12, max: 32 },
    { name: "12:00", min: 15, max: 35 },
    { name: "16:00", min: 14, max: 33 },
    { name: "20:00", min: 11, max: 30 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Current Monitoring</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current Drawn"
          value={`${latestCurrent}A`}
          icon={<Activity />}
          description="Current reading"
        />
        <StatCard
          title="Min Current (24h)"
          value={`${minCurrent}A`}
          icon={<Activity />}
          description="Last 24 hours"
        />
        <StatCard
          title="Max Current (24h)"
          value={`${maxCurrent}A`}
          icon={<Activity />}
          description="Last 24 hours"
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Status
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-2xl font-bold capitalize">{currentStatus}</div>
            <StatusIndicator
              status={currentStatus as "normal" | "warning" | "critical"}
              label={
                currentStatus === "normal"
                  ? "Normal"
                  : currentStatus === "warning"
                  ? "Warning"
                  : "Critical"
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Current Drawn (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedCurrentData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-3))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-3))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.split(":")[0]}
                  interval={Math.floor(formattedCurrentData.length / 14)}
                />
                <YAxis
                  domain={[0, 40]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}A`}
                />
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                  }}
                  labelStyle={{ color: "hsl(var(--card-foreground))" }}
                  formatter={(value) => [`${value}A`, "Current"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-3))"
                  fillOpacity={1}
                  fill="url(#colorCurrent)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Min/Max Current (24h)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={minMaxCurrentData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value}A`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                  }}
                  formatter={(value) => [`${value}A`, ""]}
                />
                <Bar
                  dataKey="min"
                  name="Min Current"
                  fill="hsl(var(--chart-2))"
                />
                <Bar
                  dataKey="max"
                  name="Max Current"
                  fill="hsl(var(--chart-1))"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Status Thresholds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <StatusIndicator status="normal" label="Normal" size="lg" />
              <p className="mt-2 text-sm text-muted-foreground">10A - 30A</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Optimal operating range
              </p>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <StatusIndicator status="warning" label="Warning" size="lg" />
              <p className="mt-2 text-sm text-muted-foreground">
                5A - 10A or 30A - 35A
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Requires attention
              </p>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <StatusIndicator status="critical" label="Critical" size="lg" />
              <p className="mt-2 text-sm text-muted-foreground">
                &lt; 5A or &gt; 35A
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Immediate action required
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrentMonitoring;
