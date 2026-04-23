import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Teams</h1>
          <Link href="/teams/create" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Create Team
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams?.map(team => (
            <div key={team.id} className="p-4 border rounded-xl bg-white dark:bg-neutral-800 dark:border-neutral-700 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-white">{team.name}</h2>
                <p className="text-neutral-600 dark:text-neutral-400">{team.description}</p>
              </div>
              <div className="mt-4 pt-4 border-t dark:border-neutral-700">
                <Link href={`/teams/${team.id}`} className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                  Manage Team
                </Link>
              </div>
            </div>
          ))}
        </div>
        {!teams?.length && (
            <p className="text-neutral-500 mt-4">No teams found. Create one to get started!</p>
        )}
      </div>
    </AppLayout>
  )
}
