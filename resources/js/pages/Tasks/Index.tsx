import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Plus, GripVertical, CheckCircle2, Clock, Circle, AlertTriangle, ListFilter, Play, Square } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

type Task = {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  assignees: { id: number, name: string }[];
  checklists_count?: number;
  completed_checklists_count?: number;
  total_minutes?: number;
  is_timer_running?: boolean;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tasks', href: '/tasks' },
];

export default function Tasks({ tasks: initialTasks = [] }: { tasks: Task[] }) {
  const { auth } = usePage().props as unknown as SharedData;
  const isAdmin = auth.user?.role === 'admin';
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'me' | 'urgent'>('all');

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    if (searchQuery.trim()) {
        result = result.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    if (activeFilter === 'me') {
        result = result.filter(t => t.assignees?.some(a => a.id === auth.user.id));
    } else if (activeFilter === 'urgent') {
        result = result.filter(t => t.priority === 'urgent' || t.priority === 'high');
    }

    return result;
  }, [tasks, searchQuery, activeFilter, auth.user.id]);

  const updateStatus = (task: Task, status: string) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: status as Task['status'] } : t));
    router.put(`/tasks/${task.id}`, { status }, { preserveScroll: true, preserveState: true });
  };

  const toggleTimer = (task: Task) => {
    if (task.is_timer_running) {
        router.post(`/tasks/${task.id}/timer/stop`, {}, { preserveScroll: true });
    } else {
        router.post(`/tasks/${task.id}/timer/start`, {}, { preserveScroll: true });
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('taskId', taskId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    if (!taskId) return;
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== status) {
        updateStatus(task, status);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'todo': return <Circle className="h-4 w-4 text-neutral-400" />;
        case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
        case 'done': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
        default: return null;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent': 
        return 'bg-red-500 text-white ring-red-600/50 dark:bg-red-900 dark:text-red-300 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]';
      case 'high': 
        return 'bg-orange-100 text-orange-700 ring-orange-600/20 dark:bg-orange-900/40 dark:text-orange-400';
      case 'medium': 
        return 'bg-blue-100 text-blue-700 ring-blue-600/20 dark:bg-blue-900/40 dark:text-blue-400';
      case 'low': 
        return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/40 dark:text-emerald-400';
      default: 
        return 'bg-neutral-100 text-neutral-700 ring-neutral-600/20 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  const getDueDateStyles = (dateStr: string | null) => {
    if (!dateStr) return 'bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-900/30 dark:text-blue-400';
    
    const dueDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-900/40 dark:text-red-400';
    if (diffDays <= 2) return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/40 dark:text-amber-400';
    return 'bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-900/30 dark:text-blue-400';
  };

  const Column = ({ title, items, status, colorClass }: { title: string, items: Task[], status: string, colorClass: string }) => (
    <div 
      className={`flex min-h-[600px] flex-col rounded-2xl bg-neutral-100/80 p-4 dark:bg-neutral-800/50 border-t-4 ${colorClass}`}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, status)}
    >
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <h2 className="font-bold tracking-wide text-neutral-700 dark:text-neutral-200">{title}</h2>
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
            {items.length}
        </span>
      </div>
      
      <div className="flex flex-1 flex-col gap-3">
        {items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-transparent dark:border-neutral-700">
                <span className="text-sm text-neutral-500">No tasks found</span>
            </div>
        ) : (
            items.map(task => (
            <div 
              key={task.id} 
              draggable 
              onDragStart={(e) => handleDragStart(e, task.id)}
              className="group flex cursor-grab flex-col rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-blue-400 hover:shadow active:cursor-grabbing dark:border-neutral-700 dark:bg-neutral-900"
            >
                <div className="mb-3 flex items-start justify-between gap-2">
                    <Link href={`/tasks/${task.id}`} className="font-semibold leading-tight text-neutral-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400">{task.title}</Link>
                    <GripVertical className="h-4 w-4 shrink-0 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>

                {task.description && <p className="mb-4 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{task.description}</p>}
                
                <div className="mb-4 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${getPriorityStyles(task.priority)}`}>
                        {task.priority}
                    </span>
                    {(task.checklists_count ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 ring-1 ring-inset ring-neutral-500/10 dark:bg-neutral-800 dark:text-neutral-400">
                            <ListFilter className="h-3 w-3" />
                            {task.completed_checklists_count}/{task.checklists_count}
                        </span>
                    )}
                    {task.due_date && (
                        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getDueDateStyles(task.due_date)}`}>
                            {new Date(task.due_date).getTime() < new Date().setHours(0,0,0,0) && <AlertTriangle className="h-3 w-3" />}
                            {new Date(task.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                        </span>
                    )}
                    {(task.total_minutes ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 ring-1 ring-inset ring-neutral-500/10 dark:bg-neutral-800 dark:text-neutral-400">
                            <Clock className="h-3 w-3" />
                            {Math.floor((task.total_minutes || 0) / 60)}h {Math.round((task.total_minutes || 0) % 60)}m
                        </span>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <div className="flex items-center gap-1">
                        {task.status !== 'done' && (
                            <button 
                                onClick={() => toggleTimer(task)} 
                                title={task.is_timer_running ? "Stop Timer" : "Start Timer"} 
                                className={`rounded p-1.5 transition-colors cursor-pointer ${task.is_timer_running ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400'}`}
                            >
                                {task.is_timer_running ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                            </button>
                        )}
                        
                        <div className="ml-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {task.status !== 'todo' && (
                                <button onClick={() => updateStatus(task, 'todo')} title="Move to To Do" className="rounded bg-neutral-100 p-1 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                                    <Circle className="h-4 w-4" />
                                </button>
                            )}
                            {task.status !== 'in_progress' && (
                                <button onClick={() => updateStatus(task, 'in_progress')} title="Move to In Progress" className="rounded bg-blue-50 p-1 text-blue-500 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:hover:bg-blue-900/40">
                                    <Clock className="h-4 w-4" />
                                </button>
                            )}
                            {task.status !== 'done' && (
                                <button onClick={() => updateStatus(task, 'done')} title="Move to Done" className="rounded bg-emerald-50 p-1 text-emerald-500 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40">
                                    <CheckCircle2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {task.assignees && task.assignees.length > 0 ? (
                        <div className="flex -space-x-2">
                            {task.assignees.map(assignee => (
                                <div key={assignee.id} title={assignee.name} className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 ring-2 ring-white dark:bg-indigo-900/50 dark:text-indigo-400 dark:ring-neutral-900">
                                    {assignee.name.charAt(0).toUpperCase()}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-6 w-6 rounded-full border border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"></div>
                    )}
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tasks" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Tasks</h1>
                <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage your workflow and track progress.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveFilter('all')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeFilter === 'all' ? 'bg-white text-indigo-600 shadow-sm dark:bg-neutral-700 dark:text-indigo-400' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                    >
                        All
                    </button>
                    {isAdmin && (
                        <button 
                            onClick={() => setActiveFilter('me')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeFilter === 'me' ? 'bg-white text-indigo-600 shadow-sm dark:bg-neutral-700 dark:text-indigo-400' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                        >
                            My Tasks
                        </button>
                    )}
                    <button 
                        onClick={() => setActiveFilter('urgent')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeFilter === 'urgent' ? 'bg-white text-indigo-600 shadow-sm dark:bg-neutral-700 dark:text-indigo-400' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                    >
                        Urgent
                    </button>
                </div>
                <div className="relative">
                    <input 
                        type="search"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="rounded-lg border-neutral-300 pl-4 pr-4 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    />
                </div>
                {auth.user?.role === 'admin' && (
                    <Link href="/tasks/create" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow">
                        <Plus className="h-4 w-4" />
                        Create Task
                    </Link>
                )}
            </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Column title="To Do" items={filteredTasks.filter(t => t.status === 'todo')} status="todo" colorClass="border-t-neutral-400 dark:border-t-neutral-500" />
          <Column title="In Progress" items={filteredTasks.filter(t => t.status === 'in_progress')} status="in_progress" colorClass="border-t-blue-500" />
          <Column title="Done" items={filteredTasks.filter(t => t.status === 'done')} status="done" colorClass="border-t-emerald-500" />
        </div>
      </div>
    </AppLayout>
  )
}
