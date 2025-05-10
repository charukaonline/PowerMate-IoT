// src/components/ui/stat-card.tsx
import React, { ReactNode, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

interface ProgressProps {
    value: number
    max: number
    color: string
}

interface StatCardProps {
    title: string
    value: ReactNode
    icon?: ReactNode
    description?: string
    highlight?: boolean
    footer?: ReactNode
    className?: string
    progress?: ProgressProps
}

const statCardVariants = cva(
    "transition-all duration-300 hover:shadow-md overflow-hidden group",
    {
        variants: {
            highlight: {
                true: "border-2 border-primary/20 bg-primary/5 hover:border-primary/30 hover:bg-primary/10",
                false: "border hover:border-muted-foreground/20 hover:bg-accent/50"
            }
        },
        defaultVariants: {
            highlight: false
        }
    }
)

export function StatCard({
                             title,
                             value,
                             icon,
                             description,
                             highlight = false,
                             footer,
                             className,
                             progress
                         }: StatCardProps) {
    // Add animation state
    const [fillHeight, setFillHeight] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    // Animate fill height on mount and when progress changes
    useEffect(() => {
        if (progress) {
            // Small delay to allow for the initial render
            const timer = setTimeout(() => {
                setFillHeight(Math.max(0, Math.min(100, (progress.value / progress.max) * 100)));
                setIsInitialized(true);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [progress?.value, progress?.max]);

    // Calculate bubbles for the animation
    const bubbles = Array(6).fill(0).map((_, i) => ({
        size: Math.floor(Math.random() * 8) + 4, // 4-12px
        left: `${Math.floor(Math.random() * 80) + 10}%`, // 10-90%
        delay: Math.random() * 3, // 0-3s delay
        duration: Math.random() * 3 + 3 // 3-6s duration
    }));

    return (
        <Card className={cn(statCardVariants({ highlight }), "relative", className)}>
            {/* Water fill effect with animated transition */}
            {progress && (
                <div
                    className={cn(
                        "absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out",
                        isInitialized ? "transition-all duration-1000 ease-out" : ""
                    )}
                    style={{
                        height: `${fillHeight}%`,
                        opacity: isInitialized ? 1 : 0,
                    }}
                >
                    <div className={cn(
                        "absolute inset-0 w-full h-full",
                        progress.color
                    )}>
                        {/* Animated waves */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 animate-[wave_2s_ease-in-out_infinite]" />
                        <div className="absolute top-2 left-0 right-0 h-1 bg-white/10"
                             style={{
                                 animation: "wave 2.5s ease-in-out infinite",
                                 animationDelay: "0.5s"
                             }}
                        />

                        {/* Bubbles animation */}
                        {bubbles.map((bubble, index) => (
                            <div
                                key={index}
                                className="absolute rounded-full bg-white/30 animate-[bubble_ease-in_forwards]"
                                style={{
                                    width: `${bubble.size}px`,
                                    height: `${bubble.size}px`,
                                    left: bubble.left,
                                    bottom: '-20%',
                                    opacity: 0,
                                    animation: `bubble ${bubble.duration}s ease-in infinite`,
                                    animationDelay: `${bubble.delay}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Card content - with relative z-index to appear above the fill */}
            <div className="relative z-10">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                        {title}
                    </CardTitle>
                    {icon && <div className="h-5 w-5 text-muted-foreground">{icon}</div>}
                </CardHeader>
                <CardContent>
                    <div className={cn(
                        "text-2xl font-bold transition-colors",
                        highlight ? "text-primary" : "text-foreground"
                    )}>
                        {value}
                    </div>
                    {description && (
                        <CardDescription className="text-xs text-muted-foreground mt-1">
                            {description}
                        </CardDescription>
                    )}
                </CardContent>
                {footer && (
                    <CardFooter className="pt-0 pb-3 px-6 text-xs text-muted-foreground">
                        {footer}
                    </CardFooter>
                )}
            </div>

        </Card>
    )
}