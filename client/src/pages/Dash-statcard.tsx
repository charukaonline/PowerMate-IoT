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

    // Calculate bubbles for the animation - improved visibility
    const bubbles = Array(6).fill(0).map((_, i) => ({
        size: Math.floor(Math.random() * 8) + 4, // 4-12px - slightly larger
        left: `${Math.floor(Math.random() * 85) + 5}%`, // 5-90%
        delay: Math.random() * 5, // 0-5s delay
        duration: Math.random() * 3 + 5, // 5-8s duration
        opacity: Math.random() * 0.25 + 0.15 // 0.15-0.4 opacity - more visible
    }));

    return (
        <Card className={cn(statCardVariants({ highlight }), "relative", className)}>
            {/* Water fill effect with animated transition */}
            {progress && (
                <div
                    className={cn(
                        "absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out overflow-hidden",
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
                        {/* Subtle surface gradient */}
                        <div
                            className="absolute inset-x-0 top-0 h-[8%] bg-gradient-to-b from-white/20 to-transparent"
                        />

                        {/* Cleaner, more subtle animated waves */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/15"
                             style={{
                                 animation: "professionalWave 4s ease-in-out infinite",
                                 transformOrigin: "center"
                             }}
                        />
                        <div className="absolute top-[4px] left-0 right-0 h-[1px] bg-white/10"
                             style={{
                                 animation: "professionalWave 4s ease-in-out infinite",
                                 animationDelay: "1s"
                             }}
                        />

                        {/* More visible bubbles animation */}
                        {bubbles.map((bubble, index) => (
                            <div
                                key={index}
                                className="absolute rounded-full shadow-sm"
                                style={{
                                    width: `${bubble.size}px`,
                                    height: `${bubble.size}px`,
                                    left: bubble.left,
                                    bottom: '-10%',
                                    background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, ${bubble.opacity + 0.1}), rgba(255, 255, 255, ${bubble.opacity}))`,
                                    boxShadow: `0 0 2px rgba(255, 255, 255, 0.1)`,
                                    animation: `visibleBubble ${bubble.duration}s ease-out infinite`,
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