import { Bell } from 'lucide-react';
import { type Notification as AppNotification } from '@/types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';



export function NotificationBell() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const unreadCount = notifications.filter((n) => !n.read_at).length;

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Listen for real-time notifications via Laravel Echo
        const userId = window.Laravel?.user?.id || 1;
        
        if (window.Echo) {
            window.Echo.private(`App.Models.User.${userId}`)
                .notification((notification: AppNotification) => {
                    setNotifications(prev => [notification, ...prev]);
                });
        }

        // Poll every 10 seconds as a fallback
        const interval = setInterval(fetchNotifications, 10000);
        return () => {
            clearInterval(interval);
            if (window.Echo) {
                window.Echo.leave(`App.Models.User.${userId}`);
            }
        };
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await axios.post(`/notifications/${id}/read`);
            setNotifications(notifications.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/mark-all-read');
            setNotifications(notifications.map((n) => ({ ...n, read_at: new Date().toISOString() })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    Notifications
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={markAllAsRead}>
                            Mark all as read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-80">
                    {notifications.length === 0 ? (
                        <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">No notifications</div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex flex-col items-start gap-1 p-4 ${!notification.read_at ? 'bg-muted/50' : ''}`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <span className="font-semibold text-sm">{notification.data.title}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{notification.data.message}</p>
                                {notification.data.url && (
                                    <a
                                        href={notification.data.url}
                                        className="mt-1 text-[10px] text-indigo-600 hover:underline dark:text-indigo-400"
                                    >
                                        View Details
                                    </a>
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
