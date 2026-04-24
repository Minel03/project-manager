import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem, type Project, type User } from '@/types';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import { UserSelect } from '@/components/ui/user-select';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Tasks', href: '/tasks' },
    { title: 'Create', href: '/tasks/create' },
];

export default function CreateTask({ projects, users }: { projects: Project[], users: User[] }) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    project_id: projects?.length > 0 ? projects[0].id : '',
    status: 'todo',
    assignees: [] as string[],
    priority: 'medium',
    due_date: ''
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post('/tasks');
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Task" />
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Create New Task</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Fill in the details below to add a new task to your project.</p>
        </div>
        
        {projects?.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">Please create a project first before creating a task.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Task Title</label>
                  <input 
                    type="text" 
                    value={data.title} 
                    onChange={e => setData('title', e.target.value)}
                    className="block w-full rounded-xl border-neutral-300 px-4 py-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-blue-500"
                    placeholder="E.g., Update landing page copy"
                  />
                  {errors.title && <div className="mt-1 text-sm text-red-500">{errors.title}</div>}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Project</label>
                      <select
                        value={data.project_id}
                        onChange={e => setData('project_id', e.target.value)}
                        className="block w-full rounded-xl border-neutral-300 px-4 py-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      >
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      {errors.project_id && <div className="mt-1 text-sm text-red-500">{errors.project_id}</div>}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Status</label>
                      <select
                        value={data.status}
                        onChange={e => setData('status', e.target.value)}
                        className="block w-full rounded-xl border-neutral-300 px-4 py-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      {errors.status && <div className="mt-1 text-sm text-red-500">{errors.status}</div>}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Assignees</label>
                      <UserSelect 
                        users={users}
                        selectedIds={data.assignees.map(id => parseInt(id))}
                        onChange={(ids) => setData('assignees', ids.map(id => id.toString()))}
                      />
                      {errors.assignees && <div className="mt-1 text-sm text-red-500">{errors.assignees}</div>}
                    </div>

                    <div className="grid gap-6 grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Priority</label>
                          <select
                            value={data.priority}
                            onChange={e => setData('priority', e.target.value)}
                            className="block w-full rounded-xl border-neutral-300 px-4 py-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                          {errors.priority && <div className="mt-1 text-sm text-red-500">{errors.priority}</div>}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Due Date</label>
                          <DatePicker 
                            date={data.due_date ? new Date(data.due_date) : undefined}
                            onChange={(date) => setData('due_date', format(date, 'yyyy-MM-dd'))}
                          />
                          {errors.due_date && <div className="mt-1 text-sm text-red-500">{errors.due_date}</div>}
                        </div>
                    </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
                  <textarea 
                    value={data.description} 
                    onChange={e => setData('description', e.target.value)}
                    className="block w-full rounded-xl border-neutral-300 px-4 py-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                    rows={5}
                    placeholder="Add any relevant details, links, or instructions..."
                  />
                  {errors.description && <div className="mt-1 text-sm text-red-500">{errors.description}</div>}
                </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-4 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                    Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={processing}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-neutral-900"
                >
                  Create Task
                </button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
