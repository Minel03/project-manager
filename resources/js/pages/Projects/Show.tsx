import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { FolderKanban, ListTodo, CheckCircle2, Clock } from 'lucide-react';

type Task = {
  id: number;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
};

type Project = {
  id: number;
  name: string;
  description: string;
  tasks?: Task[];
};

export default function ShowProject({ project }: { project: Project }) {
  const breadcrumbs: BreadcrumbItem[] = [
      { title: 'Projects', href: '/projects' },
      { title: project.name, href: `/projects/${project.id}` },
  ];

  const tasks = project.tasks || [];
  const todo = tasks.filter(t => t.status === 'todo');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const done = tasks.filter(t => t.status === 'done');
  
  const progress = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={project.name} />
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">{project.name}</h1>
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">View project details and progress.</p>
          </div>
          <div className="flex gap-3">
              <Link href="/tasks/create" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700">
                Add Task
              </Link>
              <Link href="/projects" className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700 dark:hover:bg-neutral-700">
                Back to Projects
              </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Project Details Sidebar */}
          <div className="md:col-span-1 space-y-6">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                      <FolderKanban className="h-6 w-6" />
                  </div>
                  <h2 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">Project Info</h2>
                  <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {project.description || 'No description provided for this project.'}
                  </p>
                  
                  <div className="mt-6 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                      <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">Progress</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                          <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Project Tasks Area */}
          <div className="md:col-span-2">
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                      <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-neutral-100 p-2 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                              <ListTodo className="h-5 w-5" />
                          </div>
                          <div>
                              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">To Do</p>
                              <p className="text-xl font-bold text-neutral-900 dark:text-white">{todo.length}</p>
                          </div>
                      </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                      <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                              <Clock className="h-5 w-5" />
                          </div>
                          <div>
                              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">In Progress</p>
                              <p className="text-xl font-bold text-neutral-900 dark:text-white">{inProgress.length}</p>
                          </div>
                      </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                      <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                              <CheckCircle2 className="h-5 w-5" />
                          </div>
                          <div>
                              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Completed</p>
                              <p className="text-xl font-bold text-neutral-900 dark:text-white">{done.length}</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                      <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Recent Tasks</h3>
                      <Link href="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">View Board</Link>
                  </div>
                  
                  {tasks.length === 0 ? (
                      <div className="p-8 text-center">
                          <ListTodo className="mx-auto mb-3 h-8 w-8 text-neutral-400" />
                          <p className="text-neutral-500 dark:text-neutral-400">No tasks assigned to this project yet.</p>
                      </div>
                  ) : (
                      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                          {tasks.map(task => (
                              <li key={task.id} className="flex items-center justify-between p-6 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                  <div>
                                      <p className="font-medium text-neutral-900 dark:text-white">{task.title}</p>
                                      <span className="text-xs text-neutral-400">#TASK-{task.id}</span>
                                  </div>
                                  <div>
                                      {task.status === 'todo' && <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">To Do</span>}
                                      {task.status === 'in_progress' && <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">In Progress</span>}
                                      {task.status === 'done' && <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Done</span>}
                                  </div>
                              </li>
                          ))}
                      </ul>
                  )}
              </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
