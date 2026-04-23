import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tasks', href: '/tasks' },
    { title: 'Create', href: '/tasks/create' },
];

export default function CreateTask({ projects }: { projects: any[] }) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    project_id: projects?.length > 0 ? projects[0].id : '',
    status: 'todo'
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post('/tasks');
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Task" />
      <div className="max-w-2xl mx-auto p-6 mt-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
        <h1 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">Create New Task</h1>
        
        {projects?.length === 0 ? (
          <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md mb-4 dark:bg-yellow-900/30 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
            Please create a project first before creating a task.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Task Title</label>
              <input 
                type="text" 
                value={data.title} 
                onChange={e => setData('title', e.target.value)}
                className="w-full rounded-md border-neutral-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              />
              {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Project</label>
              <select
                value={data.project_id}
                onChange={e => setData('project_id', e.target.value)}
                className="w-full rounded-md border-neutral-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.project_id && <div className="text-red-500 text-sm mt-1">{errors.project_id}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Status</label>
              <select
                value={data.status}
                onChange={e => setData('status', e.target.value)}
                className="w-full rounded-md border-neutral-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              {errors.status && <div className="text-red-500 text-sm mt-1">{errors.status}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
              <textarea 
                value={data.description} 
                onChange={e => setData('description', e.target.value)}
                className="w-full rounded-md border-neutral-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:text-white"
                rows={4}
              />
              {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
            </div>

            <button 
              type="submit" 
              disabled={processing}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Save Task
            </button>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
