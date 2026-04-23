import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type Project = {
    id: number;
    name: string;
    description: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Projects',
        href: '/projects',
    },
];

export default function Projects({ projects = [] }: { projects: Project[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Projects</h1>
                    <Link href="/projects/create" className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700">
                        Create Project
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects?.map((project) => (
                        <div key={project.id} className="rounded-xl border bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
                            <h2 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">{project.name}</h2>
                            <p className="text-neutral-600 dark:text-neutral-400">{project.description}</p>
                        </div>
                    ))}
                </div>
                {!projects?.length && <p className="mt-4 text-neutral-500">No projects found. Create one to get started!</p>}
            </div>
        </AppLayout>
    );
}
