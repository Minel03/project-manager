import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Archive, FolderKanban, Plus } from 'lucide-react';

type Project = {
    id: number;
    name: string;
    description: string;
    tasks_count?: number;
    completed_tasks_count?: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Projects',
        href: '/projects',
    },
];

export default function Projects({ projects = [] }: { projects: Project[] }) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.role === 'admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Projects</h1>
                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage and organize your team's projects.</p>
                    </div>
                    {isAdmin && (
                        <Link
                            href="/projects/create"
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow"
                        >
                            <Plus className="h-4 w-4" />
                            Create Project
                        </Link>
                    )}
                </div>

                {projects?.length === 0 ? (
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="mb-4 rounded-full bg-indigo-100 p-4 dark:bg-indigo-900/20">
                            <FolderKanban className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-white">No projects yet</h3>
                        <p className="mb-6 max-w-sm text-neutral-500 dark:text-neutral-400">
                            Get started by creating a new project to organize your tasks and collaborate with your team.
                        </p>
                        {isAdmin && (
                            <Link
                                href="/projects/create"
                                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-700"
                            >
                                Create your first project
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {projects.map((project) => {
                            const totalTasks = project.tasks_count || 0;
                            const completedTasks = project.completed_tasks_count || 0;
                            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                            return (
                                <div
                                    key={project.id}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-indigo-800"
                                >
                                    <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-indigo-50/50 transition-transform group-hover:scale-150 dark:bg-indigo-900/10"></div>
                                    <div className="relative z-10">
                                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                            <FolderKanban className="h-5 w-5" />
                                        </div>
                                        <h2 className="mb-2 line-clamp-1 text-xl font-bold text-neutral-900 dark:text-white">{project.name}</h2>
                                        <p className="mb-4 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{project.description}</p>

                                        <div className="mb-2 flex items-center justify-between text-xs font-medium text-neutral-500">
                                            <span>Progress</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                            <div
                                                className="h-full bg-indigo-500 transition-all duration-1000"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <div className="relative z-10 mt-6 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                            <Link
                                                href={`/projects/${project.id}`}
                                                className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                View Project
                                                <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </Link>
                                            <button
                                                onClick={() => router.post(route('projects.archive', project.id))}
                                                className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
                                                title="Archive Project"
                                            >
                                                <Archive className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
