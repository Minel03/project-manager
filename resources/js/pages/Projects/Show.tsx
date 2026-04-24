import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router, usePoll } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { FolderKanban, ListTodo, CheckCircle2, Clock, Users, UserPlus, X, BarChart3, PieChart as PieIcon, LineChart as LineIcon } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';

type Task = {
  id: number;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority?: string;
  assignees?: User[];
};

type User = {
    id: number;
    name: string;
    email: string;
    pivot?: {
        role: string;
    };
};

type Team = {
    id: number;
    name: string;
    users: User[];
};

type Project = {
  id: number;
  name: string;
  description: string;
  team_id: number;
  tasks?: Task[];
};

type Activity = {
    id: number;
    user: User;
    type: string;
    description: string;
    created_at: string;
};

type AnalyticsData = {
    timeDistribution: { name: string, value: number }[];
    statusCounts: { name: string, value: number }[];
    dailyTime: { date: string, minutes: number }[];
};

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ShowProject({ project, team, availableUsers, analytics, activities }: { 
    project: Project, 
    team: Team | null, 
    availableUsers: User[],
    analytics: AnalyticsData,
    activities: Activity[]
}) {
  usePoll(5000); // Soft real-time: refresh data every 5s
  
  const breadcrumbs: BreadcrumbItem[] = [
      { title: 'Projects', href: '/projects' },
      { title: project.name, href: `/projects/${project.id}` },
  ];

  const tasks = project.tasks || [];
  const todo = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const done = tasks.filter(t => t.status === 'done');
  
  const progress = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const inviteForm = useForm({
      user_id: '',
      role: 'member'
  });

  const submitInvite = (e: React.FormEvent) => {
      e.preventDefault();
      if (!team) return;
      inviteForm.post(`/teams/${team.id}/members`, {
          onSuccess: () => {
              setIsInviteOpen(false);
              inviteForm.reset();
          }
      });
  };

  const removeMember = (userId: number) => {
      if (!team) return;
      if (confirm('Are you sure you want to remove this member?')) {
          inviteForm.delete(`/teams/${team.id}/members/${userId}`);
      }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={project.name} />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6 min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">{project.name}</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{project.description || 'No description provided.'}</p>
          </div>
          <div className="flex items-center gap-4">
              <div className="hidden sm:flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-neutral-500">Project Progress</span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                  </div>
                  <div className="h-2 w-32 bg-neutral-100 rounded-full overflow-hidden dark:bg-neutral-800">
                      <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
              </div>
              <Link href={route('tasks.create', { project_id: project.id })} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700">
                New Task
              </Link>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex bg-neutral-100/50 p-1 dark:bg-neutral-800/50">
            <TabsTrigger value="overview" className="flex items-center gap-2 px-4">
                <ListTodo className="h-4 w-4" /> <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="board" className="flex items-center gap-2 px-4">
                <FolderKanban className="h-4 w-4" /> <span className="hidden sm:inline">Kanban</span> Board
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 px-4">
                <BarChart3 className="h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2 px-4">
                <Users className="h-4 w-4" /> Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 focus-visible:outline-none">
            <div className="grid gap-6 lg:grid-cols-4">
                {/* Side Stats & Activity */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                            <FolderKanban className="h-5 w-5" />
                        </div>
                        <h2 className="mb-2 text-lg font-bold text-neutral-900 dark:text-white">Project Info</h2>
                        <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {project.description || 'No description provided.'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Live Activity</h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                            {activities.length === 0 ? (
                                <p className="text-xs text-neutral-500 italic">No activity yet.</p>
                            ) : (
                                activities.map(activity => (
                                    <div key={activity.id} className="flex gap-3">
                                        <Avatar className="h-6 w-6 shrink-0">
                                            <AvatarImage src={`https://avatar.vercel.sh/${activity.user.email}`} />
                                            <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] leading-tight text-neutral-700 dark:text-neutral-300">
                                                <span className="font-bold">{activity.user.name}</span> {activity.description}
                                            </p>
                                            <p className="mt-0.5 text-[9px] text-neutral-400">
                                                {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-neutral-100 p-2.5 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                    <ListTodo className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">To Do</p>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{todo.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">In Progress</p>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{inProgress.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Completed</p>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{done.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
                            <h3 className="font-semibold text-neutral-900 dark:text-white">Recent Tasks</h3>
                            <Link href="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">View Board</Link>
                        </div>
                        {tasks.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-sm text-neutral-500">No tasks created yet.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {tasks.map(task => (
                                    <li key={task.id} className="group flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-2 w-2 rounded-full ${
                                                task.status === 'done' ? 'bg-emerald-500' : 
                                                task.status === 'in_progress' ? 'bg-blue-500' : 'bg-neutral-300'
                                            }`} />
                                            <Link href={`/tasks/${task.id}`} className="font-medium text-neutral-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                                                {task.title}
                                            </Link>
                                        </div>
                                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-tight">#TASK-{task.id}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
          </TabsContent>

          <TabsContent value="board" className="mt-6 focus-visible:outline-none">
            <div className="flex h-[calc(100vh-280px)] min-h-[500px] gap-6 overflow-x-auto pb-4 scrollbar-thin">
                {[
                    { id: 'todo', name: 'To Do', icon: ListTodo, color: 'neutral', tasks: todo },
                    { id: 'in_progress', name: 'In Progress', icon: Clock, color: 'blue', tasks: inProgress },
                    { id: 'done', name: 'Done', icon: CheckCircle2, color: 'emerald', tasks: done },
                ].map(column => (
                    <div key={column.id} className="flex w-80 shrink-0 flex-col rounded-2xl bg-neutral-100/50 p-4 dark:bg-neutral-800/30">
                        <div className="mb-4 flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <column.icon className={`h-4 w-4 text-${column.color}-500`} />
                                <h3 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs">{column.name}</h3>
                                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-neutral-500 shadow-sm dark:bg-neutral-800">
                                    {column.tasks.length}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto scrollbar-none">
                            {column.tasks.map(task => (
                                <div key={task.id} className="group relative rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-800">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <Link href={`/tasks/${task.id}`} className="text-sm font-bold leading-tight text-neutral-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
                                            {task.title}
                                        </Link>
                                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter ring-1 ring-inset ${
                                            task.priority === 'urgent' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                            task.priority === 'high' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                                            task.priority === 'medium' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                                            'bg-neutral-50 text-neutral-600 ring-neutral-500/20'
                                        }`}>
                                            {task.priority || 'low'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex -space-x-2">
                                            {task.assignees?.map((user) => (
                                                <Avatar key={user.id} className="h-6 w-6 border-2 border-white dark:border-neutral-900">
                                                    <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                                                    <AvatarFallback className="text-[8px]">{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                        
                                        <div className="flex items-center gap-1">
                                            {column.id !== 'todo' && (
                                                <button 
                                                    onClick={() => router.patch(`/tasks/${task.id}`, { status: column.id === 'done' ? 'in_progress' : 'todo' })}
                                                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
                                                    title="Move back"
                                                >
                                                    <X className="h-3.5 w-3.5 rotate-180" />
                                                </button>
                                            )}
                                            {column.id !== 'done' && (
                                                <button 
                                                    onClick={() => router.patch(`/tasks/${task.id}`, { status: column.id === 'todo' ? 'in_progress' : 'done' })}
                                                    className="rounded-lg bg-neutral-50 p-1.5 text-neutral-500 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-indigo-900/30"
                                                    title="Move forward"
                                                >
                                                    <FolderKanban className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Link 
                                href={route('tasks.create', { project_id: project.id, status: column.id })}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-200 py-3 text-xs font-semibold text-neutral-400 transition-all hover:border-indigo-300 hover:bg-white hover:text-indigo-600 dark:border-neutral-800 dark:hover:border-indigo-800 dark:hover:bg-neutral-900"
                            >
                                <X className="h-3.5 w-3.5 rotate-45" /> Add Task
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Time Distribution */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="mb-6 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                        <PieIcon className="h-4 w-4 text-indigo-500" /> Time Distribution (Minutes)
                    </h3>
                    <div className="h-[300px] w-full">
                        {analytics.timeDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.timeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analytics.timeDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        formatter={(value: number | string | readonly (number | string)[] | undefined) => {
                                            if (value === undefined) return '';
                                            const val = Number(value);
                                            if (isNaN(val)) return value;
                                            const h = Math.floor(val / 60);
                                            const m = Math.round(val % 60);
                                            return h > 0 ? `${h}h ${m}m` : `${m}m`;
                                        }}
                                        contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', padding: '8px 12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                                No time logged yet. Start a timer on a task!
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Breakdown */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="mb-6 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                        <BarChart3 className="h-4 w-4 text-emerald-500" /> Task Status Breakdown
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.statusCounts}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <RechartsTooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Daily Activity */}
                <div className="col-span-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <h3 className="mb-6 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                        <LineIcon className="h-4 w-4 text-amber-500" /> Daily Activity (Last 14 Days)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.dailyTime}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <RechartsTooltip 
                                    formatter={(value: number | string | readonly (number | string)[] | undefined) => {
                                        if (value === undefined) return '';
                                        const val = Number(value);
                                        if (isNaN(val)) return value;
                                        const h = Math.floor(val / 60);
                                        const m = Math.round(val % 60);
                                        return h > 0 ? `${h}h ${m}m` : `${m}m`;
                                    }}
                                    contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px', padding: '8px 12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="minutes" 
                                    stroke="#f59e0b" 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2 }} 
                                    activeDot={{ r: 6 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-6">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
                <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">Project Members</h3>
                    {team && (
                        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <UserPlus className="h-4 w-4" /> Invite
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Invite Member</DialogTitle>
                                    <DialogDescription>Add a new member to the {team.name} team.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={submitInvite} className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Select User</label>
                                        <Select onValueChange={(v) => inviteForm.setData('user_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a user" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableUsers.map(user => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.name} ({user.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={inviteForm.processing}>Send Invite</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {!team || team.users.length === 0 ? (
                    <div className="p-12 text-center text-sm text-neutral-500">No members found.</div>
                ) : (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {team.users.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} />
                                        <AvatarFallback className="bg-indigo-600 text-white">{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-neutral-900 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-neutral-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase">
                                        {user.pivot?.role || 'member'}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={() => removeMember(user.id)}>
                                        <X className="h-4 w-4 text-neutral-400 hover:text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
