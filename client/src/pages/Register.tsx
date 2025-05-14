// src/components/RegisterForm.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
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

export default function RegisterForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "PowerMate | Register";
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== password2) {
            setError("Passwords do not match");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const res = await axios.post(
                "http://localhost:5000/api/userAuth/signup",
                {
                    name,
                    email,
                    password,
                },
                { withCredentials: true }
            );
            // Expect something like { success: true, data: {...} }
            if (res.data.success) {
                // Redirect to login or home
                navigate("/login");
            } else {
                setError(res.data.message || "Registration failed");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Server error, please try again");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <Card className="relative w-[350px] overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>Fill in your details to get started.</CardDescription>
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
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password2">Retype Password</Label>
                            <Input
                                id="password2"
                                type="password"
                                placeholder="••••••••"
                                value={password2}
                                onChange={(e) => setPassword2(e.target.value)}
                                required
                            />
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => navigate("/login")}
                        disabled={loading}
                    >
                        Back to Login
                    </Button>
                    <Button type="submit" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Registering..." : "Register"}
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
