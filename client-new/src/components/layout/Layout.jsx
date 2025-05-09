import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { ScrollArea } from '@/components/ui/scroll-area';

const Layout = ({ children, sidebarOpen, setSidebarOpen }) => {
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setSidebarOpen]);

    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [location, isMobile, setSidebarOpen]);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <ScrollArea className="flex-1">
                    <main className="flex-1 p-4 md:p-6">{children}</main>
                </ScrollArea>
            </div>
        </div>
    );
};

export default Layout;
