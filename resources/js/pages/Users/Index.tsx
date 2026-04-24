import { useState } from 'react'; 
import AppLayout from '@/layouts/app/app-sidebar-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../components/ui/table';
import { UserPlus, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

export default function Index({ users }: { users: User[] }) {
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, delete: destroy } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'member',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                setIsAddUserOpen(false);
                reset();
            },
        });
    };

    const deleteUser = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            destroy(route('users.destroy', id));
        }
    };

    return (
        <AppLayout>
            <Head title="User Management" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">User Management</h1>
                        <p className="text-sm text-neutral-500">Manage your team members and their roles.</p>
                    </div>

                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <UserPlus className="h-4 w-4" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={submit}>
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                    <DialogDescription>
                                        Create a new account for a team member. They can log in immediately with the password you set.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="John Doe"
                                        />
                                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="john@example.com"
                                        />
                                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Minimum 8 characters"
                                        />
                                        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="member">Member (Standard Access)</SelectItem>
                                                <SelectItem value="admin">Admin (Full Control)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create User'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                <UserIcon className="h-4 w-4 text-neutral-500" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-neutral-900 dark:text-white">{user.name}</span>
                                                <span className="text-xs text-neutral-500">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="gap-1 capitalize">
                                            {user.role === 'admin' ? <Shield className="h-3 w-3" /> : null}
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-neutral-500 text-sm">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                            onClick={() => deleteUser(user.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
