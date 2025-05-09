// src/components/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

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

    useEffect(() => {
        document.title = "PowerMate | Profile";

        const fetchProfile = async () => {
            try {
                const res = await axios.get<{
                    success: boolean;
                    user: UserProfile;
                }>(
                    "http://localhost:5000/api/me",
                    { withCredentials: true }
                );
                if (res.data.success) {
                    setUser(res.data.user);
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
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-6 w-1/3" />
                        </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : user ? (
                        <dl className="grid grid-cols-1 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    User ID
                                </dt>
                                <dd className="mt-1 text-gray-900 dark:text-gray-100 break-all">
                                    {user._id}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Name
                                </dt>
                                <dd className="mt-1 text-gray-900 dark:text-gray-100">
                                    {user.name}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Email
                                </dt>
                                <dd className="mt-1 text-gray-900 dark:text-gray-100">
                                    {user.email}
                                </dd>
                            </div>
                            {user.createdAt && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Joined
                                    </dt>
                                    <dd className="mt-1 text-gray-900 dark:text-gray-100">
                                        {new Date(user.createdAt).toLocaleString()}
                                    </dd>
                                </div>
                            )}
                            {user.updatedAt && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Last Updated
                                    </dt>
                                    <dd className="mt-1 text-gray-900 dark:text-gray-100">
                                        {new Date(user.updatedAt).toLocaleString()}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    ) : null}
                </CardContent>
            </Card>
        </div>
    );
}
