import { useEffect } from 'react';
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
import useThresholdStore from '@/store/thresholdStore';

const Settings = () => {
    const { toast } = useToast();
    
    // Use the threshold store instead of local state
    const { 
        thresholds, 
        isLoading, 
        error, 
        fetchThresholds, 
        updateThresholds,
        updateThresholdValue, 
        clearError 
    } = useThresholdStore();

    // Fetch user's threshold settings
    useEffect(() => {
        fetchThresholds();
    }, [fetchThresholds]);

    // Show toast on error
    useEffect(() => {
        if (error) {
            toast({
                title: "Error",
                description: error,
                variant: "destructive"
            });
            clearError();
        }
    }, [error, toast, clearError]);

    const handleSave = async () => {
        const result = await updateThresholds(thresholds);
        
        if (result.success) {
            toast({
                title: "Settings saved",
                description: "Your settings have been saved successfully.",
            });
        }
    };

    // Show loading state
    if (isLoading && !thresholds) {
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
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
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

                <TabsContent value="thresholds" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Power Supply Thresholds
                            </CardTitle>
                            <CardDescription>
                                Configure voltage and current thresholds for power supply monitoring
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="min-voltage">Minimum Voltage (V)</Label>
                                    <Input
                                        id="min-voltage"
                                        type="number"
                                        value={thresholds.powerSupply.minVoltage}
                                        onChange={(e) => updateThresholdValue(
                                            'powerSupply',
                                            'minVoltage',
                                            e.target.value
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max-voltage">Maximum Voltage (V)</Label>
                                    <Input
                                        id="max-voltage"
                                        type="number"
                                        value={thresholds.powerSupply.maxVoltage}
                                        onChange={(e) => updateThresholdValue(
                                            'powerSupply',
                                            'maxVoltage',
                                            e.target.value
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="min-ps-current">Minimum Current (A)</Label>
                                    <Input
                                        id="min-ps-current"
                                        type="number"
                                        value={thresholds.powerSupply.minCurrent}
                                        onChange={(e) => updateThresholdValue(
                                            'powerSupply',
                                            'minCurrent',
                                            e.target.value
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max-ps-current">Maximum Current (A)</Label>
                                    <Input
                                        id="max-ps-current"
                                        type="number"
                                        value={thresholds.powerSupply.maxCurrent}
                                        onChange={(e) => updateThresholdValue(
                                            'powerSupply',
                                            'maxCurrent',
                                            e.target.value
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Battery className="h-5 w-5" />
                                Backup Battery Thresholds
                            </CardTitle>
                            <CardDescription>
                                Configure voltage and current thresholds for backup battery monitoring
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="min-batt-voltage">Minimum Voltage (V)</Label>
                                    <Input
                                        id="min-batt-voltage"
                                        type="number"
                                        step="0.1"
                                        value={thresholds.backupBattery.minVoltage}
                                        onChange={(e) => updateThresholdValue(
                                            'backupBattery',
                                            'minVoltage',
                                            e.target.value
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max-batt-voltage">Maximum Voltage (V)</Label>
                                    <Input
                                        id="max-batt-voltage"
                                        type="number"
                                        step="0.1"
                                        value={thresholds.backupBattery.maxVoltage}
                                        onChange={(e) => updateThresholdValue(
                                            'backupBattery',
                                            'maxVoltage',
                                            e.target.value
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="min-current">Minimum Current (A)</Label>
                                    <Input
                                        id="min-current"
                                        type="number"
                                        value={thresholds.backupBattery.minCurrent}
                                        onChange={(e) => updateThresholdValue(
                                            'backupBattery',
                                            'minCurrent',
                                            e.target.value
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max-current">Maximum Current (A)</Label>
                                    <Input
                                        id="max-current"
                                        type="number"
                                        value={thresholds.backupBattery.maxCurrent}
                                        onChange={(e) => updateThresholdValue(
                                            'backupBattery',
                                            'maxCurrent',
                                            e.target.value
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Gauge className="h-5 w-5" />
                                Generator Thresholds
                            </CardTitle>
                            <CardDescription>
                                Configure generator capacity and critical levels
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="tank-capacity">Generator Capacity (L)</Label>
                                    <Input
                                        id="tank-capacity"
                                        type="number"
                                        value={thresholds.generator.tankCapacity}
                                        onChange={(e) => updateThresholdValue(
                                            'generator',
                                            'tankCapacity',
                                            e.target.value
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="critical-fuel">Critical Level (%)</Label>
                                    <Input
                                        id="critical-fuel"
                                        type="number"
                                        value={thresholds.generator.criticalLevel}
                                        onChange={(e) => updateThresholdValue(
                                            'generator',
                                            'criticalLevel',
                                            e.target.value
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ...existing code for other tabs... */}
            </Tabs>
        </div>
    );
};

export default Settings;
