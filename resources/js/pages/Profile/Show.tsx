import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { CheckCircle2, Clock, Calendar, Zap, TrendingUp, Map as MapIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type User = {
    id: number;
    name: string;
    email: string;
};

type ActivityPoint = {
    date: string;
    count: number;
};

type Stats = {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    on_time_rate: number;
};

export default function ShowProfile({ profileUser, stats, activityData }: { profileUser: User; stats: Stats; activityData: ActivityPoint[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Profile', href: '#' },
        { title: profileUser.name, href: `/profile/${profileUser.id}` },
    ];

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, []);

    const activityMap = activityData.reduce(
        (acc, curr) => {
            acc[curr.date] = curr.count;
            return acc;
        },
        {} as Record<string, number>,
    );

    const days = Array.from({ length: 365 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (364 - i));
        return d.toISOString().split('T')[0];
    });

    const getIntensity = (count: number) => {
        if (!count) return 'bg-neutral-100 dark:bg-neutral-800';
        if (count < 2) return 'bg-indigo-200 dark:bg-indigo-900/40';
        if (count < 5) return 'bg-indigo-400 dark:bg-indigo-700/60';
        return 'bg-indigo-600 dark:bg-indigo-500';
    };

    // Calculate month labels positions
    const monthLabels: { label: string; offset: number }[] = [];
    days.forEach((day, i) => {
        if (i % 7 === 0) {
            const date = new Date(day);
            const month = date.toLocaleDateString(undefined, { month: 'short' });
            if (monthLabels.length === 0 || monthLabels[monthLabels.length - 1].label !== month) {
                monthLabels.push({ label: month, offset: Math.floor(i / 7) });
            }
        }
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${profileUser.name}'s Profile`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 min-w-0 overflow-hidden">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <div className="flex w-full items-center gap-6">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white shadow-lg">
                            {profileUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">{profileUser.name}</h1>
                            <p className="mt-1 truncate text-neutral-500 dark:text-neutral-400">{profileUser.email}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-700/10 ring-inset dark:bg-indigo-900/30 dark:text-indigo-400">
                                    <Zap className="h-3 w-3" /> Active Contributor
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-700/10 ring-inset dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <TrendingUp className="h-3 w-3" /> {stats.on_time_rate}% On-time Rate
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: 'Total Tasks', value: stats.total_tasks, icon: Calendar, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Completed', value: stats.completed_tasks, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Pending', value: stats.pending_tasks, icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                        { label: 'On-time Rate', value: `${stats.on_time_rate}%`, icon: Zap, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</div>
                            <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* GitHub Style Activity Graph */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 min-w-0">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                            <MapIcon className="h-5 w-5 text-indigo-500" />
                            Contribution Graph
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <span>Less</span>
                            {[0, 1, 5, 10].map(v => (
                                <div key={v} className={`h-3 w-3 rounded-sm ${getIntensity(v)}`} />
                            ))}
                            <span>More</span>
                        </div>
                    </div>

                    <div className="flex w-full min-w-0 overflow-hidden">
                        {/* Day labels on the left */}
                        <div className="flex flex-col justify-between text-[10px] text-neutral-400 pr-2 pt-8 pb-4 h-[120px] font-medium leading-none shrink-0">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                        </div>

                        {/* Scrollable area for the months and grid */}
                        <div 
                            ref={scrollContainerRef}
                            className="flex-1 overflow-x-auto min-w-0 pb-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700"
                        >
                            <div className="inline-block min-w-max">
                                {/* Months row */}
                                <div className="relative h-6 w-full text-[10px] text-neutral-400 font-medium">
                                    {monthLabels.map((m, i) => (
                                        <span key={i} className="absolute" style={{ left: `${m.offset * 16}px` }}>
                                            {m.label}
                                        </span>
                                    ))}
                                </div>

                                {/* Contribution Grid */}
                                <TooltipProvider delayDuration={0}>
                                    <div className="grid grid-flow-col grid-rows-7 gap-1">
                                        {days.map((day) => {
                                            const count = activityMap[day] || 0;
                                            return (
                                                <Tooltip key={day}>
                                                    <TooltipTrigger asChild>
                                                        <div 
                                                            className={`h-3 w-3 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-pointer ${getIntensity(count)}`}
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-neutral-900 text-white border-none text-[10px] px-2 py-1">
                                                        <span className="font-bold">{count} contributions</span> on {new Date(day).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </TooltipContent>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Productivity Banner */}
                <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-lg">
                    <div className="flex items-center gap-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold italic">"Focus on being productive instead of busy."</h3>
                            <p className="text-sm text-indigo-100 opacity-90">You have completed {stats.completed_tasks} tasks this year.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
