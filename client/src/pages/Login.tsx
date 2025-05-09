// src/components/LoginForm.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { useAuthStore } from "@/stores/authStore";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, isLoading, error, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    // redirect on success
    useEffect(() => {
        if (isAuthenticated) navigate("/");
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        document.title = "PowerMate | Login";
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <Card className="relative w-[350px] overflow-hidden
                       bg-white dark:bg-gray-800
                       border border-gray-200 dark:border-gray-700
                       text-gray-900 dark:text-gray-100">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="grid w-full gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email" className="dark:text-gray-300">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white dark:bg-gray-700"
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password" className="dark:text-gray-300">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white dark:bg-gray-700"
                            />
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/register")}
                        disabled={isLoading}
                        className="dark:border-gray-600 dark:text-gray-100"
                    >
                        Register
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </Button>
                </CardFooter>

                <BorderBeam
                    duration={4}
                    size={300}
                    reverse
                    className="from-transparent via-green-500 to-transparent"
                />
            </Card>
        </div>
    );
}
