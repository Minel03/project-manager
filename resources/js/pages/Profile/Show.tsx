import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Calendar, CheckCircle2, Clock, Map as MapIcon, TrendingUp, Zap } from 'lucide-react';
import { useEffect, useRef, useMemo } from 'react';

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

    const days = useMemo(() => {
        const result = [];
        const d = new Date();
        const dayOfWeek = d.getDay();
        const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
        
        const startDate = new Date();
        startDate.setDate(d.getDate() - (364 + diffToMonday));
        
        for (let i = 0; i < 371; i++) {
            const current = new Date(startDate);
            current.setDate(startDate.getDate() + i);
            result.push(current.toISOString().split('T')[0]);
        }
        return result;
    }, []);

    const monthLabels = useMemo(() => {
        const labels: { label: string; offset: number }[] = [];
        let lastMonth = '';
        days.forEach((day, i) => {
            if (i % 7 === 0) {
                const date = new Date(day);
                const month = date.toLocaleDateString(undefined, { month: 'short' });
                if (month !== lastMonth) {
                    labels.push({ label: month, offset: i / 7 });
                    lastMonth = month;
                }
            }
        });
        return labels;
    }, [days]);

    const getIntensity = (count: number) => {
        if (!count) return 'bg-neutral-100 dark:bg-neutral-800';
        if (count < 2) return 'bg-indigo-200 dark:bg-indigo-900/40';
        if (count < 5) return 'bg-indigo-400 dark:bg-indigo-700/60';
        return 'bg-indigo-600 dark:bg-indigo-500';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${profileUser.name}'s Profile`} />
            <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white shadow-lg sm:h-20 sm:w-20 sm:text-2xl">
                            {profileUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">{profileUser.name}</h1>
                            <p className="mt-0.5 truncate text-xs text-neutral-500 sm:text-base dark:text-neutral-400">{profileUser.email}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 sm:gap-1.5 sm:px-2 sm:py-1 sm:text-xs dark:bg-indigo-900/30 dark:text-indigo-400">
                                    <Zap className="h-3 w-3" /> <span className="hidden sm:inline">Active</span> Contributor
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-700/10 sm:gap-1.5 sm:px-2 sm:py-1 sm:text-xs dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <TrendingUp className="h-3 w-3" /> {stats.on_time_rate}% <span className="hidden sm:inline">On-time</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                    {[
                        { label: 'Total Tasks', value: stats.total_tasks, icon: Calendar, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                        { label: 'Completed', value: stats.completed_tasks, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                        { label: 'Pending', value: stats.pending_tasks, icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                        { label: 'On-time', value: `${stats.on_time_rate}%`, icon: Zap, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
                    ].map((stat, i) => (
                        <div key={i} className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-6 dark:border-neutral-800 dark:bg-neutral-900 transition-all hover:border-indigo-500/50">
                            <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg sm:mb-4 sm:h-10 sm:w-10 ${stat.color}`}>
                                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">{stat.value}</div>
                            <div className="text-[10px] font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* GitHub Style Activity Graph */}
                <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                            <MapIcon className="h-5 w-5 text-indigo-500" />
                            Contribution Graph
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <span>Less</span>
                            {[0, 1, 5, 10].map((v) => (
                                <div key={v} className={`h-3 w-3 rounded-sm ${getIntensity(v)}`} />
                            ))}
                            <span>More</span>
                        </div>
                    </div>

                    <div
                        ref={scrollContainerRef}
                        className="scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 w-full overflow-x-auto pb-4"
                    >
                        <div className="mx-auto flex min-w-max items-start justify-center gap-2 px-4 [--col-width:16px] sm:[--col-width:22px]">
                            {/* Day labels */}
                            <div className="flex flex-col justify-between text-[10px] text-neutral-400 pt-10 pb-2 h-[135px] sm:h-[155px] font-medium leading-none shrink-0">
                                <span>Mon</span>
                                <span>Wed</span>
                                <span>Fri</span>
                            </div>

                            <div className="flex-1">
                                {/* Months row - Grid-locked to the columns below */}
                                <div className="mb-2 grid grid-flow-col auto-cols-[var(--col-width)] text-[10px] sm:text-xs text-neutral-400 font-medium">
                                    {Array.from({ length: 53 }).map((_, i) => {
                                        const label = monthLabels.find(m => m.offset === i);
                                        return (
                                            <div key={i} className="relative h-4">
                                                {label && (
                                                    <span className="absolute left-0 whitespace-nowrap">
                                                        {label.label}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Contribution Grid */}
                                <TooltipProvider delayDuration={0}>
                                    <div className="grid grid-flow-col grid-rows-7 gap-1 sm:gap-1.5">
                                        {days.map((day) => {
                                            const count = activityMap[day] || 0;
                                            return (
                                                <Tooltip key={day}>
                                                    <TooltipTrigger asChild>
                                                        <div 
                                                            className={`h-3 w-3 sm:h-4 sm:w-4 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-pointer ${getIntensity(count)}`}
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-neutral-900 text-white border-none text-[10px] px-2 py-1 shadow-xl">
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
