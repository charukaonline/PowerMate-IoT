import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Activity,
    BarChart3,
    Battery,
    Gauge,
    Home,
    Settings,
    User,
    Zap,
    X,
    Radio,
} from 'lucide-react';

const Sidebar = ({ open, setOpen }) => {
    const location = useLocation();

    const routes = [
        {
            title: 'Dashboard',
            href: '/',
            icon: <Home className="h-5 w-5" />,
        },
        {
            title: 'Power Supply',
            href: '/power-supply',
            icon: <Zap className="h-5 w-5" />,
        },
        {
            title: 'Backup Battery',
            href: '/backup-battery',
            icon: <Battery className="h-5 w-5" />,
        },
        {
            title: 'Generator Fuel',
            href: '/generator-fuel',
            icon: <Gauge className="h-5 w-5" />,
        },
        {
            title: 'Settings',
            href: '/settings',
            icon: <Settings className="h-5 w-5" />,
        },
        // {
        //     title: 'Profile',
        //     href: '/profile',
        //     icon: <User className="h-5 w-5" />,
        // },
    ];

    return (
        <div
            className={cn(
                'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform duration-300 md:relative md:translate-x-0',
                open ? 'translate-x-0' : '-translate-x-full'
            )}
        >
            <div className="flex h-16 items-center justify-between border-b px-4">
                <Link to="/" className="flex items-center gap-2 font-semibold">
                    <Radio className="h-6 w-6 text-primary" />
                    <span>Cell Tower Monitor</span>
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setOpen(false)}
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close sidebar</span>
                </Button>
            </div>
            <ScrollArea className="flex-1 py-4">
                <nav className="grid gap-1 px-2">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            to={route.href}
                            className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                                location.pathname === route.href
                                    ? 'bg-accent text-accent-foreground'
                                    : 'transparent'
                            )}
                        >
                            {route.icon}
                            {route.title}
                        </Link>
                    ))}
                </nav>
            </ScrollArea>
            <div className="border-t p-4">
                <div className="flex items-center gap-3 rounded-md bg-muted px-3 py-2">
                    <div className="flex items-center justify-center rounded-full bg-primary h-8 w-8 text-primary-foreground">
                        <BarChart3 className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium leading-none">
                            System Status
                        </p>
                        <p className="text-xs text-muted-foreground">
                            All systems operational
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
