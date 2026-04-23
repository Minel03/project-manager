import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Users, Plus } from 'lucide-react';

type Team = {
  id: number;
  name: string;
  description: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Teams', href: '/teams' },
];

export default function Teams({ teams = [] }: { teams: Team[] }) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Teams" />
      <div className="flex h-full flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Teams</h1>
                <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage your teams and collaborations.</p>
            </div>
            <Link href="/teams/create" className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow">
                <Plus className="h-4 w-4" />
                Create Team
            </Link>
        </div>

        {teams?.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="mb-4 rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/20">
                    <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="mb-1 text-xl font-semibold text-neutral-900 dark:text-white">No teams yet</h3>
                <p className="mb-6 max-w-sm text-neutral-500 dark:text-neutral-400">Create a team to group your projects and manage permissions easily.</p>
                <Link href="/teams/create" className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-700">
                    Create your first team
                </Link>
            </div>
        ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {teams.map(team => (
                    <div key={team.id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-emerald-800">
                        <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-emerald-50/50 transition-transform group-hover:scale-150 dark:bg-emerald-900/10"></div>
                        <div className="relative z-10">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <Users className="h-5 w-5" />
                            </div>
                            <h2 className="mb-2 line-clamp-1 text-xl font-bold text-neutral-900 dark:text-white">{team.name}</h2>
                            <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{team.description}</p>
                        </div>
                        <div className="relative z-10 mt-6 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                            <Link href={`/teams/${team.id}`} className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                                Manage Team
                                <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </AppLayout>
  )
}
