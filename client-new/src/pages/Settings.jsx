import { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Battery,
    Gauge,
    Save,
    Settings as SettingsIcon,
    Zap,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
// import { settingsData } from '@/lib/mock-data';
import { getUserThresholds, updateUserThresholds } from '@/services/thresholdService';

const Settings = () => {
    const { toast } = useToast();
    // const [settings, setSettings] = useState(settingsData);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Fetch user's threshold settings
    useEffect(() => {
        const fetchThresholds = async () => {
            try {
                setLoading(true);
                const response = await getUserThresholds();

                if (response.success && response.data) {
                    // If backend data exists, use it instead of mock data
                    // Merge with defaults to ensure all properties exist
                    setSettings({
                        ...settingsData,
                        ...response.data,
                        thresholds: {
                            ...settingsData.thresholds,
                            ...(response.data.thresholds || {})
                        }
                    });
                }
            } catch (err) {
                console.error('Failed to fetch threshold settings:', err);
                setError('Failed to load settings. Using default values.');
                toast({
                    title: "Error loading settings",
                    description: "Falling back to default values.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchThresholds();
    }, [toast]);

    const handleSave = async () => {
        try {
            setSaving(true);

            // Extract relevant data to send to the server
            const thresholdData = {
                thresholds: settings.thresholds,
                tankCapacity: settings.tankCapacity
            };

            const response = await updateUserThresholds(thresholdData);

            if (response.success) {
                toast({
                    title: "Settings saved",
                    description: "Your settings have been saved successfully.",
                });
            } else {
                throw new Error(response.message || 'Failed to save settings');
            }
        } catch (err) {
            console.error('Error saving settings:', err);
            toast({
                title: "Error saving settings",
                description: "Please try again later.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    // Show loading state
    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-4">
                    {error}
                </div>
            )}

            <Tabs defaultValue="thresholds">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>

                <TabsContent value="thresholds" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Voltage Thresholds
                            </CardTitle>
                            <CardDescription>
                                Configure voltage thresholds for alerts and monitoring
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="min-voltage">Minimum Voltage (V)</Label>
                                    <Input
                                        id="min-voltage"
                                        type="number"
                                        value={settings.thresholds.voltage.min}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                voltage: {
                                                    ...settings.thresholds.voltage,
                                                    min: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max-voltage">Maximum Voltage (V)</Label>
                                    <Input
                                        id="max-voltage"
                                        type="number"
                                        value={settings.thresholds.voltage.max}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                voltage: {
                                                    ...settings.thresholds.voltage,
                                                    max: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="warning-min-voltage">Warning Min Voltage (V)</Label>
                                    <Input
                                        id="warning-min-voltage"
                                        type="number"
                                        value={settings.thresholds.voltage.warningMin}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                voltage: {
                                                    ...settings.thresholds.voltage,
                                                    warningMin: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="warning-max-voltage">Warning Max Voltage (V)</Label>
                                    <Input
                                        id="warning-max-voltage"
                                        type="number"
                                        value={settings.thresholds.voltage.warningMax}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                voltage: {
                                                    ...settings.thresholds.voltage,
                                                    warningMax: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Current Thresholds
                            </CardTitle>
                            <CardDescription>
                                Configure current thresholds for alerts and monitoring
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="min-current">Minimum Current (A)</Label>
                                    <Input
                                        id="min-current"
                                        type="number"
                                        value={settings.thresholds.current.min}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                current: {
                                                    ...settings.thresholds.current,
                                                    min: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max-current">Maximum Current (A)</Label>
                                    <Input
                                        id="max-current"
                                        type="number"
                                        value={settings.thresholds.current.max}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                current: {
                                                    ...settings.thresholds.current,
                                                    max: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="warning-min-current">Warning Min Current (A)</Label>
                                    <Input
                                        id="warning-min-current"
                                        type="number"
                                        value={settings.thresholds.current.warningMin}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                current: {
                                                    ...settings.thresholds.current,
                                                    warningMin: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="warning-max-current">Warning Max Current (A)</Label>
                                    <Input
                                        id="warning-max-current"
                                        type="number"
                                        value={settings.thresholds.current.warningMax}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                current: {
                                                    ...settings.thresholds.current,
                                                    warningMax: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Gauge className="h-5 w-5" />
                                    Fuel Thresholds
                                </CardTitle>
                                <CardDescription>
                                    Configure fuel level thresholds
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="warning-fuel">Warning Level (%)</Label>
                                    <Input
                                        id="warning-fuel"
                                        type="number"
                                        value={settings.thresholds.fuel.warningLevel}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                fuel: {
                                                    ...settings.thresholds.fuel,
                                                    warningLevel: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="critical-fuel">Critical Level (%)</Label>
                                    <Input
                                        id="critical-fuel"
                                        type="number"
                                        value={settings.thresholds.fuel.criticalLevel}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                fuel: {
                                                    ...settings.thresholds.fuel,
                                                    criticalLevel: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tank-capacity">Tank Capacity (L)</Label>
                                    <Input
                                        id="tank-capacity"
                                        type="number"
                                        value={settings.tankCapacity}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            tankCapacity: parseFloat(e.target.value)
                                        })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Battery className="h-5 w-5" />
                                    Battery Thresholds
                                </CardTitle>
                                <CardDescription>
                                    Configure battery thresholds
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="warning-voltage">Warning Voltage (V)</Label>
                                    <Input
                                        id="warning-voltage"
                                        type="number"
                                        step="0.1"
                                        value={settings.thresholds.battery.warningVoltage}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                battery: {
                                                    ...settings.thresholds.battery,
                                                    warningVoltage: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="critical-voltage">Critical Voltage (V)</Label>
                                    <Input
                                        id="critical-voltage"
                                        type="number"
                                        step="0.1"
                                        value={settings.thresholds.battery.criticalVoltage}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                battery: {
                                                    ...settings.thresholds.battery,
                                                    criticalVoltage: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max-temperature">Max Temperature (°C)</Label>
                                    <Input
                                        id="max-temperature"
                                        type="number"
                                        value={settings.thresholds.battery.maxTemperature}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            thresholds: {
                                                ...settings.thresholds,
                                                battery: {
                                                    ...settings.thresholds.battery,
                                                    maxTemperature: parseFloat(e.target.value)
                                                }
                                            }
                                        })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>
                                Configure how and when you receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="email-notifications">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive notifications via email
                                    </p>
                                </div>
                                <Switch id="email-notifications" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive notifications via SMS
                                    </p>
                                </div>
                                <Switch id="sms-notifications" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="push-notifications">Push Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive push notifications on your devices
                                    </p>
                                </div>
                                <Switch id="push-notifications" defaultChecked />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="notification-frequency">Notification Frequency</Label>
                                    <span className="text-sm">Every 15 minutes</span>
                                </div>
                                <Slider
                                    id="notification-frequency"
                                    defaultValue={[15]}
                                    max={60}
                                    min={5}
                                    step={5}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>5m</span>
                                    <span>30m</span>
                                    <span>60m</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave} className="ml-auto">Save Notification Settings</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Alert Types</CardTitle>
                            <CardDescription>
                                Choose which types of alerts you want to receive
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Switch id="voltage-alerts" defaultChecked />
                                    <Label htmlFor="voltage-alerts">Voltage Alerts</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="current-alerts" defaultChecked />
                                    <Label htmlFor="current-alerts">Current Alerts</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="fuel-alerts" defaultChecked />
                                    <Label htmlFor="fuel-alerts">Fuel Level Alerts</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="battery-alerts" defaultChecked />
                                    <Label htmlFor="battery-alerts">Battery Alerts</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="temperature-alerts" defaultChecked />
                                    <Label htmlFor="temperature-alerts">Temperature Alerts</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="maintenance-alerts" defaultChecked />
                                    <Label htmlFor="maintenance-alerts">Maintenance Alerts</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SettingsIcon className="h-5 w-5" />
                                System Settings
                            </CardTitle>
                            <CardDescription>
                                Configure system-wide settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="refresh-rate">Data Refresh Rate (seconds)</Label>
                                <div className="flex items-center gap-4">
                                    <Slider
                                        id="refresh-rate"
                                        defaultValue={[30]}
                                        max={120}
                                        min={5}
                                        step={5}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        defaultValue={30}
                                        className="w-20"
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>5s</span>
                                    <span>60s</span>
                                    <span>120s</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="data-retention">Data Retention Period</Label>
                                <select
                                    id="data-retention"
                                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="7">7 days</option>
                                    <option value="30">30 days</option>
                                    <option value="90">90 days</option>
                                    <option value="180">180 days</option>
                                    <option value="365">1 year</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <select
                                    id="timezone"
                                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern Time (ET)</option>
                                    <option value="America/Chicago">Central Time (CT)</option>
                                    <option value="America/Denver">Mountain Time (MT)</option>
                                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="auto-backup">Automatic Backups</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically backup system data
                                    </p>
                                </div>
                                <Switch id="auto-backup" defaultChecked />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSave} className="ml-auto">Save System Settings</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>API Integration</CardTitle>
                            <CardDescription>
                                Configure API settings for external integrations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="api-key">API Key</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="api-key"
                                        type="password"
                                        value="sk_live_51NzUBTKLksdJKLSDJFLKSDJFLKSDJFLKSDJFLKSDJFLKSDJFLKSDJFLKSDJFLKSDJFLKSDJFLKSDJFLK"
                                    />
                                    <Button variant="outline">Regenerate</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Settings;