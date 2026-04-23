import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

type Team = {
  id: number;
  name: string;
  description: string;
}

export default function ShowTeam({ team }: { team: Team }) {
  const breadcrumbs: BreadcrumbItem[] = [
      { title: 'Teams', href: '/teams' },
      { title: team.name, href: `/teams/${team.id}` },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={team.name} />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{team.name}</h1>
          <Link href="/teams" className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded hover:bg-neutral-300 dark:hover:bg-neutral-600 transition">
            Back to Teams
          </Link>
        </div>

        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">Team Details</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Description</p>
              <p className="text-neutral-800 dark:text-neutral-200 mt-1">
                {team.description || 'No description provided.'}
              </p>
            </div>
            
            <div className="pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-4">Team Members</h3>
              <p className="text-neutral-500 italic">Members functionality coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
