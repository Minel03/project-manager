import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { Shield, UserMinus, Plus, Users, User as UserIcon } from 'lucide-react';

type User = {
    id: number;
    name: string;
    email: string;
    pivot?: { role: string };
};

type Team = {
  id: number;
  name: string;
  description: string;
  users?: User[];
};

export default function ShowTeam({ team, availableUsers = [] }: { team: Team, availableUsers: User[] }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [role, setRole] = useState('member');

  const breadcrumbs: BreadcrumbItem[] = [
      { title: 'Teams', href: '/teams' },
      { title: team.name, href: `/teams/${team.id}` },
  ];

  const addMember = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUser) return;
      router.post(`/teams/${team.id}/members`, { user_id: selectedUser, role }, {
          preserveScroll: true,
          onSuccess: () => {
              setSelectedUser('');
              setRole('member');
          }
      });
  };

  const removeMember = (userId: number) => {
      if (confirm('Are you sure you want to remove this member?')) {
          router.delete(`/teams/${team.id}/members/${userId}`, { preserveScroll: true });
      }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={team.name} />
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">{team.name}</h1>
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">Manage team details and members.</p>
          </div>
          <Link href="/teams" className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700 dark:hover:bg-neutral-700">
            Back to Teams
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Team Details Sidebar */}
          <div className="md:col-span-1">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Users className="h-6 w-6" />
                  </div>
                  <h2 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">Team Info</h2>
                  <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {team.description || 'No description provided for this team.'}
                  </p>
                  
                  <div className="mt-6 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                      <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Members</span>
                          <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                              {team.users?.length || 0}
                          </span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Members Management Area */}
          <div className="md:col-span-2 space-y-6">
              {/* Add Member Form */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <h3 className="mb-4 text-lg font-medium text-neutral-900 dark:text-white">Add Team Member</h3>
                  {availableUsers.length === 0 ? (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">All registered users are already in this team.</p>
                  ) : (
                      <form onSubmit={addMember} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                          <div className="flex-1">
                              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">User</label>
                              <select 
                                  value={selectedUser} 
                                  onChange={e => setSelectedUser(e.target.value)}
                                  className="block w-full rounded-lg border-neutral-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                  required
                              >
                                  <option value="" disabled>Select a user...</option>
                                  {availableUsers.map(u => (
                                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                  ))}
                              </select>
                          </div>
                          <div className="w-full sm:w-1/3">
                              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Role</label>
                              <select 
                                  value={role} 
                                  onChange={e => setRole(e.target.value)}
                                  className="block w-full rounded-lg border-neutral-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                              >
                                  <option value="member">Member</option>
                                  <option value="admin">Admin</option>
                              </select>
                          </div>
                          <button type="submit" disabled={!selectedUser} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50 sm:w-auto">
                              <Plus className="h-4 w-4" />
                              Add
                          </button>
                      </form>
                  )}
              </div>

              {/* Members List */}
              <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-800/50">
                      <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Current Members</h3>
                  </div>
                  
                  {(!team.users || team.users.length === 0) ? (
                      <div className="p-8 text-center">
                          <UserIcon className="mx-auto mb-3 h-8 w-8 text-neutral-400" />
                          <p className="text-neutral-500 dark:text-neutral-400">No members in this team yet.</p>
                      </div>
                  ) : (
                      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                          {team.users.map(user => (
                              <li key={user.id} className="flex items-center justify-between p-6 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                  <div className="flex items-center gap-4">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                                          {user.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                          <p className="font-medium text-neutral-900 dark:text-white">{user.name}</p>
                                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                          {user.pivot?.role === 'admin' ? <Shield className="h-3 w-3 text-emerald-500" /> : <UserIcon className="h-3 w-3" />}
                                          <span className="capitalize">{user.pivot?.role}</span>
                                      </span>
                                      <button onClick={() => removeMember(user.id)} title="Remove Member" className="rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                                          <UserMinus className="h-4 w-4" />
                                      </button>
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
