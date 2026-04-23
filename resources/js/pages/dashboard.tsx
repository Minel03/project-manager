import { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { FolderKanban, CheckCircle2, ListTodo, Activity } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface ActivityLog {
    id: number;
    action: string;
    details: string | null;
    created_at: string;
    user?: { name: string };
    project?: { name: string };
    task?: { title: string };
}

interface DashboardProps {
    projects: number;
    tasks: number;
    completedTasks: number;
    recentActivity: ActivityLog[];
}

function AnimatedNumber({ value }: { value: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (value === 0) {
            setCount(0);
            return;
        }
        
        let start = 0;
        const duration = 1000;
        const incrementTime = Math.max(10, Math.floor(duration / value));
        const increment = Math.max(1, Math.ceil(value / (duration / incrementTime)));

        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{count}</span>;
}

export default function Dashboard({ projects, tasks, completedTasks, recentActivity = [] }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-indigo-900/50 dark:from-indigo-950/20 dark:to-neutral-900">
                        <div className="absolute -right-6 -top-6 rounded-full bg-indigo-500/10 p-8 transition-transform duration-500 group-hover:scale-110 dark:bg-indigo-500/5">
                            <FolderKanban className="h-12 w-12 text-indigo-500/40 dark:text-indigo-400/20" />
                        </div>
                        <div className="z-10 flex flex-col items-center">
                            <h2 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400">Total Projects</h2>
                            <p className="mt-2 text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                <AnimatedNumber value={projects} />
                            </p>
                        </div>
                    </div>
                    <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-blue-900/50 dark:from-blue-950/20 dark:to-neutral-900">
                        <div className="absolute -right-6 -top-6 rounded-full bg-blue-500/10 p-8 transition-transform duration-500 group-hover:scale-110 dark:bg-blue-500/5">
                            <ListTodo className="h-12 w-12 text-blue-500/40 dark:text-blue-400/20" />
                        </div>
                        <div className="z-10 flex flex-col items-center">
                            <h2 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400">Total Tasks</h2>
                            <p className="mt-2 text-5xl font-extrabold text-blue-600 dark:text-blue-400">
                                <AnimatedNumber value={tasks} />
                            </p>
                        </div>
                    </div>
                    <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-emerald-900/50 dark:from-emerald-950/20 dark:to-neutral-900">
                        <div className="absolute -right-6 -top-6 rounded-full bg-emerald-500/10 p-8 transition-transform duration-500 group-hover:scale-110 dark:bg-emerald-500/5">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500/40 dark:text-emerald-400/20" />
                        </div>
                        <div className="z-10 flex flex-col items-center">
                            <h2 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400">Completed Tasks</h2>
                            <p className="mt-2 text-5xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                <AnimatedNumber value={completedTasks} />
                            </p>
                        </div>
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[50vh] flex-1 rounded-xl border bg-white p-6 shadow-sm md:min-h-min dark:bg-neutral-900">
                    <div className="mb-6 flex items-center gap-2">
                        <Activity className="h-6 w-6 text-indigo-500" />
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Recent Activity</h2>
                    </div>
                    
                    {recentActivity.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 py-12 dark:border-neutral-800">
                            <Activity className="mb-3 h-8 w-8 text-neutral-400 dark:text-neutral-600" />
                            <p className="text-neutral-500 dark:text-neutral-400">No recent activity found.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex gap-4">
                                    <div className="relative mt-1 flex h-3 w-3 items-center justify-center">
                                        <span className="absolute h-full w-full animate-ping rounded-full bg-indigo-400 opacity-20"></span>
                                        <span className="relative h-2 w-2 rounded-full bg-indigo-500"></span>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                            {activity.user?.name || 'System'} {activity.action}
                                            {activity.project && <span className="font-semibold text-indigo-600 dark:text-indigo-400"> {activity.project.name}</span>}
                                            {activity.task && <span className="font-semibold text-blue-600 dark:text-blue-400"> {activity.task.title}</span>}
                                        </p>
                                        <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
                                            {new Date(activity.created_at).toLocaleDateString(undefined, { 
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
