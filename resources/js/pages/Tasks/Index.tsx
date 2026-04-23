import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

type Task = {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tasks', href: '/tasks' },
];

export default function Tasks({ tasks = [] }: { tasks: Task[] }) {
  const todo = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const done = tasks.filter(t => t.status === 'done');

  const Column = ({ title, items, status }: { title: string, items: Task[], status: string }) => (
    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 min-h-[500px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-neutral-700 dark:text-neutral-300">{title}</h2>
        <span className="bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs px-2 py-1 rounded-full">{items.length}</span>
      </div>
      <div className="space-y-3">
        {items.map(task => (
          <div key={task.id} className="bg-white dark:bg-neutral-900 p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:border-blue-400 transition">
            <h3 className="font-medium text-neutral-900 dark:text-white">{task.title}</h3>
            {task.description && <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{task.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tasks" />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Tasks</h1>
          <Link href="/tasks/create" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Create Task
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Column title="To Do" items={todo} status="todo" />
          <Column title="In Progress" items={inProgress} status="in_progress" />
          <Column title="Done" items={done} status="done" />
        </div>
      </div>
    </AppLayout>
  )
}
