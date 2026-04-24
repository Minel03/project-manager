import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

export interface Project {
    id: number;
    title: string;
    name: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
    project_id: number;
    created_at: string;
    updated_at: string;
    total_minutes?: number;
    is_timer_running?: boolean;
}

export interface Notification {
    id: string;
    type: string;
    data: {
        title?: string;
        message: string;
        task_id?: number;
        project_id?: number;
        url?: string;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
}

export interface LaravelEcho {
    private: (channel: string) => {
        notification: (callback: (notification: Notification) => void) => void;
    };
    leave: (channel: string) => void;
}

declare global {
    interface Window {
        Pusher: unknown;
        Echo: LaravelEcho;
        Laravel: {
            user: User | null;
        };
    }
}
