import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Teams', href: '/teams' },
    { title: 'Create', href: '/teams/create' },
];

export default function CreateTeam() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post('/teams');
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Team" />
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Create New Team</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Set up a new team and start collaborating.</p>
        </div>
        
        <form onSubmit={submit} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Team Name</label>
                  <input 
                    type="text" 
                    value={data.name} 
                    onChange={e => setData('name', e.target.value)}
                    className="block w-full rounded-xl border-neutral-300 px-4 py-3 text-sm shadow-sm transition-colors focus:border-emerald-500 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-emerald-500"
                    placeholder="E.g., Engineering Squad"
                  />
                  {errors.name && <div className="mt-1 text-sm text-red-500">{errors.name}</div>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Description</label>
                  <textarea 
                    value={data.description} 
                    onChange={e => setData('description', e.target.value)}
                    className="block w-full rounded-xl border-neutral-300 px-4 py-3 text-sm shadow-sm transition-colors focus:border-emerald-500 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-emerald-500"
                    rows={5}
                    placeholder="Briefly describe the team's purpose..."
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
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-neutral-900"
                >
                  Create Team
                </button>
            </div>
        </form>
      </div>
    </AppLayout>
  );
}
