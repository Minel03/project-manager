import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, CheckCircle2, FolderKanban, ListTodo, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface ActivityRecord {
    id: number;
    type: string;
    description: string;
    created_at: string;
    user?: { name: string };
    project?: { name: string };
    task?: { title: string };
}

interface ProjectData {
    id: number;
    name: string;
    tasks_count: number;
    completed_count: number;
    progress_percentage: number;
}

interface DashboardProps {
    stats: {
        totalProjects: number;
        totalTasks: number;
        completedTasks: number;
    };
    projects: ProjectData[];
    statusData: { name: string; value: number; color: string }[];
    weeklyProgress: { day: string; completed: number }[];
    recentActivity: ActivityRecord[];
}

function AnimatedNumber({ value }: { value: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1000;
        if (value === 0) return setCount(0);

        const incrementTime = Math.max(10, Math.floor(duration / value));
        const timer = setInterval(() => {
            start += 1;
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

export default function Dashboard({ stats, projects, statusData, weeklyProgress, recentActivity = [] }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-indigo-100 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-indigo-900/50 dark:bg-neutral-900">
                        <div className="absolute -top-4 -right-4 rounded-full bg-indigo-50 p-8 dark:bg-indigo-950/20">
                            <FolderKanban className="h-8 w-8 text-indigo-500" />
                        </div>
                        <div className="relative z-10 text-center">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Projects</h2>
                            <p className="mt-1 text-4xl font-black text-indigo-600 dark:text-indigo-400">
                                <AnimatedNumber value={stats.totalProjects} />
                            </p>
                        </div>
                    </div>

                    <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-blue-900/50 dark:bg-neutral-900">
                        <div className="absolute -top-4 -right-4 rounded-full bg-blue-50 p-8 dark:bg-blue-950/20">
                            <ListTodo className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="relative z-10 text-center">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Tasks</h2>
                            <p className="mt-1 text-4xl font-black text-blue-600 dark:text-blue-400">
                                <AnimatedNumber value={stats.totalTasks} />
                            </p>
                        </div>
                    </div>

                    <div className="group relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm transition-all hover:shadow-md dark:border-emerald-900/50 dark:bg-neutral-900">
                        <div className="absolute -top-4 -right-4 rounded-full bg-emerald-50 p-8 dark:bg-emerald-950/20">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        </div>
                        <div className="relative z-10 text-center">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Completed</h2>
                            <p className="mt-1 text-4xl font-black text-emerald-600 dark:text-emerald-400">
                                <AnimatedNumber value={stats.completedTasks} />
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Weekly Productivity Chart */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                                <TrendingUp className="h-5 w-5 text-indigo-500" />
                                Weekly Productivity
                            </h3>
                        </div>
                        <div className="relative w-full" style={{ minHeight: 250 }}>
                            <ResponsiveContainer width="100%" aspect={2}>
                                <AreaChart data={weeklyProgress}>
                                    <defs>
                                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            borderRadius: '12px',
                                            border: '1px solid #e5e5e5',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        }}
                                    />
                                    <Area
                                        name="Completed"
                                        type="monotone"
                                        dataKey="completed"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCompleted)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Task Status Distribution */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                                <PieChartIcon className="h-5 w-5 text-blue-500" />
                                Task Status Distribution
                            </h3>
                        </div>
                        <div className="relative flex w-full items-center justify-center gap-4" style={{ minHeight: 300 }}>
                            <div className="h-[300px] w-2/3">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex w-1/3 flex-col gap-3 pr-4">
                                {statusData.map((item) => (
                                    <div key={item.name} className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                            <span className="text-[10px] font-bold text-neutral-900 dark:text-white">{item.value}</span>
                                        </div>
                                        <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Project Progress Bars */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Active Projects Progress</h3>
                            <p className="text-sm text-neutral-500">Real-time status of your unarchived projects.</p>
                        </div>
                        <div className="space-y-6">
                            {projects.map((project) => (
                                <div key={project.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/projects/${project.id}`}
                                            className="font-semibold text-neutral-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                                        >
                                            {project.name}
                                        </Link>
                                        <span className="text-xs font-bold text-neutral-500">{project.progress_percentage}%</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-1000"
                                            style={{ width: `${project.progress_percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex gap-3 text-[10px] text-neutral-500">
                                        <span>Total: {project.tasks_count}</span>
                                        <span>Completed: {project.completed_count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                            <Activity className="h-5 w-5 text-indigo-500" />
                            Recent Activity
                        </h3>
                        <div className="relative space-y-6 before:absolute before:top-2 before:left-2 before:h-[calc(100%-16px)] before:w-px before:bg-neutral-100 dark:before:bg-neutral-800">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="relative pl-6">
                                    <div className="absolute top-1.5 left-0 h-4 w-4 rounded-full border-2 border-white bg-indigo-500 dark:border-neutral-900"></div>
                                    <div className="space-y-1">
                                        <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                                            <span className="font-bold text-neutral-900 dark:text-white">{activity.user?.name}</span>{' '}
                                            {activity.description}
                                        </p>
                                        <p className="text-[10px] font-bold tracking-tight text-neutral-400 uppercase">
                                            {new Date(activity.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
