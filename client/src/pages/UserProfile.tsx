// src/components/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon, CheckIcon } from "@radix-ui/react-icons";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Key } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Profile edit states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    // Password change states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    // Use the auth store to get the current user state
    const { isAuthenticated, user: authUser, token } = useAuthStore();

    useEffect(() => {
        document.title = "PowerMate | Profile";

        const fetchProfile = async () => {
            try {
                setLoading(true);

                // Check if we already have user data in the auth store
                if (isAuthenticated && authUser) {
                    setUser(authUser as UserProfile);
                    setName(authUser.name);
                    setEmail(authUser.email);
                    setLoading(false);
                    return;
                }

                // If not, fetch from API
                const res = await axios.get<{
                    success: boolean;
                    user: UserProfile;
                }>(
                    "http://localhost:5000/api/me",
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: token ? `Bearer ${token}` : undefined
                        }
                    }
                );

                if (res.data.success) {
                    setUser(res.data.user);
                    setName(res.data.user.name);
                    setEmail(res.data.user.email);
                } else {
                    setError("Failed to load profile data");
                }
            } catch (err: any) {
                console.error(err);
                setError(
                    err.response?.data?.message ||
                    "Server error while loading profile"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated, authUser, token]);

    const handleUpdateProfile = async () => {
        try {
            setSavingProfile(true);
            setError("");
            setSuccessMessage("");

            // Validate input
            if (!name.trim() || !email.trim()) {
                setError("Name and email are required");
                return;
            }

            // Make API call to update profile
            const res = await axios.put(
                "http://localhost:5000/api/me/update",
                { name, email },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: token ? `Bearer ${token}` : undefined
                    }
                }
            );

            if (res.data.success) {
                // Update local state
                setUser(prev => prev ? { ...prev, name, email } : null);
                setSuccessMessage("Profile updated successfully");

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            } else {
                throw new Error(res.data.message || "Failed to update profile");
            }
        } catch (err: any) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Server error while updating profile"
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = async () => {
        try {
            setSavingPassword(true);
            setPasswordError("");
            setSuccessMessage("");

            // Validate passwords
            if (!currentPassword) {
                setPasswordError("Current password is required");
                return;
            }

            if (newPassword !== confirmPassword) {
                setPasswordError("New passwords don't match");
                return;
            }

            if (newPassword.length < 8) {
                setPasswordError("Password must be at least 8 characters long");
                return;
            }

            // Make API call to change password
            const res = await axios.put(
                "http://localhost:5000/api/me/change-password",
                {
                    currentPassword,
                    newPassword
                },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: token ? `Bearer ${token}` : undefined
                    }
                }
            );

            if (res.data.success) {
                // Clear password fields
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");

                setSuccessMessage("Password changed successfully");

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            } else {
                throw new Error(res.data.message || "Failed to change password");
            }
        } catch (err: any) {
            console.error(err);
            setPasswordError(
                err.response?.data?.message ||
                "Server error while changing password"
            );
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold tracking-tight mb-6">Your Profile</h1>

            {loading ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-6 w-1/3" />
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert className="mb-4 bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400">
                            <CheckIcon className="h-4 w-4" />
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    )}

                    <Tabs defaultValue="profile" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="profile">Profile Information</TabsTrigger>
                            <TabsTrigger value="password">Change Password</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>
                                        Update your personal information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your.email@example.com"
                                        />
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="space-y-2">
                                        <Label className="text-sm text-muted-foreground">Account Information</Label>
                                        <div className="grid grid-cols-1 gap-4 rounded-md bg-muted p-4">
                                            <div>
                                                <span className="text-sm font-medium text-muted-foreground">User ID</span>
                                                <p className="text-sm break-all">{user?._id}</p>
                                            </div>
                                            {user?.createdAt && (
                                                <div>
                                                    <span className="text-sm font-medium text-muted-foreground">Joined</span>
                                                    <p className="text-sm">{new Date(user.createdAt).toLocaleString()}</p>
                                                </div>
                                            )}
                                            {user?.updatedAt && (
                                                <div>
                                                    <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                                                    <p className="text-sm">{new Date(user.updatedAt).toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={handleUpdateProfile}
                                        disabled={savingProfile}
                                        className="ml-auto"
                                    >
                                        {savingProfile ? (
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
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="password">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>
                                        Update your password to keep your account secure
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {passwordError && (
                                        <Alert variant="destructive">
                                            <ExclamationTriangleIcon className="h-4 w-4" />
                                            <AlertDescription>{passwordError}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input
                                            id="current-password"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="text-sm text-muted-foreground mt-2">
                                        <p>Password must be at least 8 characters long.</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={handlePasswordChange}
                                        disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                                        className="ml-auto"
                                    >
                                        {savingPassword ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Changing...
                                            </>
                                        ) : (
                                            <>
                                                <Key className="mr-2 h-4 w-4" />
                                                Change Password
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}