import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface FullBatteryData {
    _id: string;
    deviceId: string;
    voltage: number;
    current: number;
    percentage: number;
    timestamp: string;
}

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.2,
            when: "beforeChildren"
        }
    }
};

const cardVariants: Variants = {
    hidden: { y: 20, opacity: 0, scale: 0.98 },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const rowVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const floatingBlobVariants: Variants = {
    initial: { x: 0, y: 0 },
    animate: {
        x: [0, 10, -5, 0],
        y: [0, -10, 5, 0],
        transition: {
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut"
        }
    }
};

const buttonVariants: Variants = {
    inactive: { scale: 1, boxShadow: "0px 0px 0px rgba(0,0,0,0)" },
    active: {
        scale: 1.05,
        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
        backgroundColor: "rgba(59, 130, 246, 0.15)"
    },
    hover: { scale: 1.05 }
};

const paginationItemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 25
        }
    }
};

export default function FullBatteryHistory() {
    const [allData, setAllData] = useState<FullBatteryData[]>([]);
    const [displayData, setDisplayData] = useState<FullBatteryData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pagination and view settings
    const [itemsPerPage, setItemsPerPage] = useState<25 | 50 | 100>(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5000/api/full-battery-history/88:13:BF:0C:3B:6C"
                );
                setAllData(response.data);
                setError(null);
            } catch (err) {
                setError("Failed to fetch full battery history data.");
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Update pagination whenever allData or itemsPerPage changes
    useEffect(() => {
        if (allData.length > 0) {
            setTotalPages(Math.ceil(allData.length / itemsPerPage));
            // Reset to first page when changing items per page
            setCurrentPage(1);
        }
    }, [allData, itemsPerPage]);

    // Update displayed data based on pagination
    useEffect(() => {
        if (allData.length > 0) {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, allData.length);
            setDisplayData(allData.slice(startIndex, endIndex));
        }
    }, [allData, currentPage, itemsPerPage]);

    // Pagination controls
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (value: 25 | 50 | 100) => {
        setItemsPerPage(value);
    };

    // Calculate page numbers to display
    const getPageNumbers = () => {
        const maxVisiblePages = 5;
        const pageNumbers: number[] = [];

        if (totalPages <= maxVisiblePages) {
            // Display all pages if total pages are less than max visible
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always include first page
            pageNumbers.push(1);

            // Calculate start and end of middle section
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            // Adjust to show 3 pages in the middle when possible
            if (startPage === 2) endPage = Math.min(4, totalPages - 1);
            if (endPage === totalPages - 1) startPage = Math.max(2, totalPages - 3);

            // Add ellipsis after first page if needed
            if (startPage > 2) pageNumbers.push(-1); // -1 represents ellipsis

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) pageNumbers.push(-2); // -2 represents the second ellipsis

            // Always include last page
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        transition: {
                            duration: 0.5,
                            ease: "easeOut"
                        }
                    }}
                    className="backdrop-blur-lg bg-white/30 dark:bg-black/30 p-6 rounded-2xl shadow-xl"
                >
                    <motion.div
                        animate={{
                            opacity: [0.5, 1, 0.5],
                            scale: [0.98, 1.02, 0.98]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="text-center"
                    >
                        Loading...
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-zinc-900 dark:to-red-950">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                            type: "spring",
                            stiffness: 100,
                            damping: 15
                        }
                    }}
                    className="backdrop-blur-lg bg-white/30 dark:bg-black/30 text-red-500 p-6 rounded-2xl shadow-xl"
                >
                    <motion.div
                        initial={{ x: -5 }}
                        animate={{ x: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 10
                        }}
                    >
                        {error}
                    </motion.div>
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-zinc-900 dark:to-zinc-800 overflow-hidden"
        >
            <div className="container mx-auto p-6 relative z-10">
                {/* Decorative animated elements */}
                <motion.div
                    variants={floatingBlobVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    variants={floatingBlobVariants}
                    initial="initial"
                    animate="animate"
                    custom={1}
                    className="absolute top-1/3 -right-10 w-60 h-60 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl"
                />

                <motion.div variants={cardVariants}>
                    <Card className="backdrop-blur-xl bg-white/70 dark:bg-zinc-900/70 border border-white/20 dark:border-zinc-700/30 rounded-2xl shadow-xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-900/20 dark:to-blue-900/20 backdrop-blur-md border-b border-white/10 dark:border-zinc-800/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        transition: {
                                            delay: 0.3,
                                            duration: 0.5
                                        }
                                    }}
                                >
                                    <CardTitle className="text-xl font-medium text-green-600 dark:text-green-400">
                                        Full Battery History
                                    </CardTitle>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            delay: 0.5,
                                            duration: 0.5
                                        }
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Items per page:</span>
                                    <div className="flex backdrop-blur-md bg-white/30 dark:bg-black/20 rounded-lg p-1">
                                        {[25, 50, 100].map((value) => (
                                            <motion.button
                                                key={value}
                                                variants={buttonVariants}
                                                initial="inactive"
                                                animate={itemsPerPage === value ? "active" : "inactive"}
                                                whileHover="hover"
                                                onClick={() => handleItemsPerPageChange(value as 25 | 50 | 100)}
                                                className={`px-3 py-1 text-sm rounded-md transition-all ${
                                                    itemsPerPage === value
                                                        ? "bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 font-medium"
                                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
                                                }`}
                                            >
                                                {value}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="overflow-x-auto rounded-b-2xl">
                                <Table>
                                    <TableCaption className="p-4 bg-gradient-to-r from-gray-100/50 to-gray-200/50 dark:from-zinc-800/50 dark:to-zinc-900/50 backdrop-blur-sm text-muted-foreground">
                                        Battery statistics for device{" "}
                                        <motion.code
                                            initial={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                                            whileHover={{
                                                backgroundColor: "rgba(0,0,0,0.08)",
                                                transition: { duration: 0.2 }
                                            }}
                                            className="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-md"
                                        >
                                            88:13:BF:0C:3B:6C
                                        </motion.code>
                                    </TableCaption>
                                    <TableHeader className="bg-gray-100/70 dark:bg-zinc-800/70 backdrop-blur-sm">
                                        <TableRow className="border-b border-white/10 dark:border-zinc-700/30">
                                            <TableHead className="font-medium">Device ID</TableHead>
                                            <TableHead className="font-medium">Voltage (V)</TableHead>
                                            <TableHead className="font-medium">Current (A)</TableHead>
                                            <TableHead className="font-medium">Percentage (%)</TableHead>
                                            <TableHead className="font-medium">Timestamp</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <AnimatePresence mode="wait">
                                        <TableBody>
                                            {displayData.map((item, index) => (
                                                <motion.tr
                                                    key={item._id}
                                                    variants={rowVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit={{ opacity: 0, x: -10 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    whileHover={{
                                                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                                                        transition: { duration: 0.2 }
                                                    }}
                                                    className={`${index % 2 === 0 ? 'bg-white/50 dark:bg-zinc-900/50' : 'bg-gray-50/50 dark:bg-zinc-800/50'} backdrop-blur-sm transition-colors`}
                                                >
                                                    <TableCell className="font-mono text-xs">{item.deviceId}</TableCell>
                                                    <TableCell>{item.voltage.toFixed(2)}</TableCell>
                                                    <TableCell>{item.current.toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <motion.span
                                                            whileHover={{
                                                                scale: 1.05,
                                                                transition: { duration: 0.2 }
                                                            }}
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100/70 dark:bg-green-900/30 text-green-800 dark:text-green-300 backdrop-blur-sm"
                                                        >
                                                            {item.percentage}%
                                                        </motion.span>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                                                        {format(new Date(item.timestamp), "PPpp")}
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </TableBody>
                                    </AnimatePresence>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        delay: 0.6,
                                        duration: 0.5
                                    }
                                }}
                                className="flex items-center justify-between p-4 border-t border-white/10 dark:border-zinc-800/50 bg-gray-50/80 dark:bg-zinc-800/80 backdrop-blur-sm"
                            >
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, allData.length)} of {allData.length} entries
                                </div>

                                <div className="flex items-center gap-1">
                                    <motion.button
                                        variants={paginationItemVariants}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`p-2 rounded-lg ${
                                            currentPage === 1
                                                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m15 18-6-6 6-6"/>
                                        </svg>
                                    </motion.button>

                                    <AnimatePresence mode="wait">
                                        {getPageNumbers().map((pageNum, index) => (
                                            pageNum < 0 ? (
                                                // Ellipsis
                                                <motion.span
                                                    key={`ellipsis-${pageNum}`}
                                                    variants={paginationItemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit={{ opacity: 0, y: 10 }}
                                                    transition={{ delay: 0.1 + index * 0.05 }}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400"
                                                >
                                                    ...
                                                </motion.span>
                                            ) : (
                                                // Page number
                                                <motion.button
                                                    key={pageNum}
                                                    variants={paginationItemVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit={{ opacity: 0, y: 10 }}
                                                    transition={{ delay: 0.1 + index * 0.05 }}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => goToPage(pageNum)}
                                                    className={`w-8 h-8 rounded-lg ${
                                                        pageNum === currentPage
                                                            ? "bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 font-medium"
                                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </motion.button>
                                            )
                                        ))}
                                    </AnimatePresence>

                                    <motion.button
                                        variants={paginationItemVariants}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`p-2 rounded-lg ${
                                            currentPage === totalPages
                                                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m9 18 6-6-6-6"/>
                                        </svg>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}