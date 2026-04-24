import { DatePicker } from '@/components/ui/date-picker';
import { UserSelect } from '@/components/ui/user-select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import {
    AlertCircle,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    Flag,
    Loader2,
    MessageSquare,
    Paperclip,
    Send,
    Sparkles,
    Trash2,
    UploadCloud,
    User as UserIcon,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
};

type Comment = {
    id: number;
    user: User;
    comment: string;
    created_at: string;
};

type Attachment = {
    id: number;
    file_name: string;
    file_url: string;
    created_at: string;
};

type ChecklistItem = {
    id: number;
    content: string;
    is_completed: boolean;
};

type Task = {
    id: number;
    title: string;
    description: string;
    status: 'todo' | 'in_progress' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date: string | null;
    assignees: User[];
    project: { id: number; name: string };
    comments: Comment[];
    attachments: Attachment[];
    checklists: ChecklistItem[];
    total_minutes: number;
    is_timer_running: boolean;
    blocked_by_id: number | null;
    blockedBy: { id: number; title: string; status: string } | null;
};

export default function ShowTask({ task, users, allTasks }: { task: Task; users: User[]; allTasks: { id: number; title: string }[] }) {
    const { props } = usePage();
    const serverErrors = props.errors as unknown as Record<string, string>;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tasks', href: '/tasks' },
        { title: `TASK-${task.id}`, href: `/tasks/${task.id}` },
    ];

    const { data, setData, post, processing, reset } = useForm({
        comment: '',
    });

    const checklistForm = useForm({
        content: '',
    });

    const [mentionSearch, setMentionSearch] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    const [mentionIndex, setMentionIndex] = useState(0);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(mentionSearch.toLowerCase())
    );

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setData('comment', val);

        const cursor = e.target.selectionStart || 0;
        const textBeforeCursor = val.slice(0, cursor);
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

        if (mentionMatch) {
            setMentionSearch(mentionMatch[1]);
            setShowMentions(true);
            setMentionIndex(0);
        } else {
            setShowMentions(false);
        }
    };

    const selectMention = (user: User) => {
        const input = document.getElementById('comment-input') as HTMLInputElement;
        const cursor = input?.selectionStart || data.comment.length;
        const textBeforeCursor = data.comment.slice(0, cursor);
        const textAfterCursor = data.comment.slice(cursor);
        
        const newTextBefore = textBeforeCursor.replace(/@(\w*)$/, `@${user.name} `);
        setData('comment', newTextBefore + textAfterCursor);
        setShowMentions(false);
        
        setTimeout(() => {
            input?.focus();
            const newCursor = newTextBefore.length;
            input?.setSelectionRange(newCursor, newCursor);
        }, 0);
    };

    const [isUploading, setIsUploading] = useState(false);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateAIBreakdown = async () => {
        setIsGeneratingAI(true);
        try {
            await axios.post(`/tasks/${task.id}/ai-breakdown`);
            router.reload();
        } catch (error) {
            console.error('AI Breakdown failed', error);
        } finally {
            setIsGeneratingAI(false);
        }
    };

    useEffect(() => {
        if (serverErrors.file) {
            console.error('Upload Error:', serverErrors.file);
        }
    }, [serverErrors]);

    const addChecklistItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!checklistForm.data.content.trim()) return;

        checklistForm.post(`/tasks/${task.id}/checklists`, {
            preserveScroll: true,
            onSuccess: () => checklistForm.reset('content'),
        });
    };

    const [selectedChecklistIds, setSelectedChecklistIds] = useState<number[]>([]);

    const toggleSelection = (id: number) => {
        setSelectedChecklistIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const bulkDeleteChecklists = () => {
        if (selectedChecklistIds.length === 0) return;
        if (confirm(`Are you sure you want to delete ${selectedChecklistIds.length} items?`)) {
            router.post('/checklists/bulk-delete', { ids: selectedChecklistIds }, {
                preserveScroll: true,
                onSuccess: () => setSelectedChecklistIds([]),
            });
        }
    };

    const toggleChecklistItem = (id: number) => {
        router.post(`/checklists/${id}/toggle`, {}, { preserveScroll: true });
    };

    const deleteChecklistItem = (id: number) => {
        if (confirm('Are you sure you want to delete this checklist?')) {
            router.delete(`/checklists/${id}`, { preserveScroll: true });
        }
    };

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/tasks/${task.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => reset('comment'),
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        router.post(`/tasks/${task.id}/attachments`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    const updateField = (field: string, value: string | string[] | number | number[] | null) => {
        router.put(`/tasks/${task.id}`, { [field]: value }, { preserveScroll: true });
    };

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);
    const [editedDesc, setEditedDesc] = useState(task.description || '');

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-500 text-white ring-red-600/50 dark:bg-red-900 dark:text-red-300 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]';
            case 'high':
                return 'bg-orange-100 text-orange-700 ring-orange-600/20 dark:bg-orange-900/40 dark:text-orange-400';
            case 'medium':
                return 'bg-blue-100 text-blue-700 ring-blue-600/20 dark:bg-blue-900/40 dark:text-blue-400';
            case 'low':
                return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/40 dark:text-emerald-400';
            default:
                return 'bg-neutral-100 text-neutral-700 ring-neutral-600/20 dark:bg-neutral-800 dark:text-neutral-400';
        }
    };

    const handleTitleSave = () => {
        if (editedTitle !== task.title) {
            updateField('title', editedTitle);
        }
        setIsEditingTitle(false);
    };

    const handleDescSave = () => {
        if (editedDesc !== task.description) {
            updateField('description', editedDesc);
        }
        setIsEditingDesc(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={task.title} />
            <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
                <div className="flex items-center justify-between gap-8 border-b border-neutral-200 pb-4 dark:border-neutral-800">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{task.project?.name}</span>
                            <span className="text-neutral-300 dark:text-neutral-600">•</span>
                            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">#TASK-{task.id}</span>
                        </div>
                        {isEditingTitle ? (
                            <input
                                autoFocus
                                className="w-full rounded-lg border-neutral-300 bg-white px-2 py-1 text-3xl font-bold tracking-tight text-neutral-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                            />
                        ) : (
                            <h1
                                onClick={() => setIsEditingTitle(true)}
                                className="cursor-pointer rounded-lg border border-transparent px-1 text-3xl font-bold tracking-tight text-neutral-900 hover:border-neutral-200 hover:bg-neutral-50 dark:text-white dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50"
                            >
                                {task.title}
                            </h1>
                        )}
                    </div>
                    <Link
                        href="/tasks"
                        className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium whitespace-nowrap text-neutral-700 shadow-sm ring-1 ring-neutral-300 ring-inset hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700 dark:hover:bg-neutral-700"
                    >
                        Back to Board
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="space-y-6 md:col-span-2">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Description</h2>
                                {!isEditingDesc && (
                                    <button
                                        onClick={() => setIsEditingDesc(true)}
                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-300">
                                {isEditingDesc ? (
                                    <div className="space-y-3">
                                        <textarea
                                            autoFocus
                                            rows={6}
                                            className="w-full rounded-xl border-neutral-300 bg-neutral-50 p-4 text-sm focus:border-indigo-500 focus:bg-white focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                            value={editedDesc}
                                            onChange={(e) => setEditedDesc(e.target.value)}
                                            placeholder="Describe this task..."
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleDescSave}
                                                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                                            >
                                                Save changes
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditingDesc(false);
                                                    setEditedDesc(task.description || '');
                                                }}
                                                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : task.description ? (
                                    <p
                                        onClick={() => setIsEditingDesc(true)}
                                        className="cursor-pointer leading-relaxed whitespace-pre-wrap transition-colors hover:text-neutral-900 dark:hover:text-white"
                                    >
                                        {task.description}
                                    </p>
                                ) : (
                                    <p
                                        onClick={() => setIsEditingDesc(true)}
                                        className="cursor-pointer text-neutral-400 italic transition-colors hover:text-neutral-500"
                                    >
                                        No description provided. Click to add one.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Checklist Section */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                        <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                                        Checklist
                                    </h2>
                                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                                        {task.checklists.filter((i) => i.is_completed).length}/{task.checklists.length}
                                    </span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2">
                                    {selectedChecklistIds.length > 0 && (
                                        <button
                                            onClick={bulkDeleteChecklists}
                                            className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 active:scale-95"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                            <span>Delete {selectedChecklistIds.length}</span>
                                        </button>
                                    )}
                                    {task.checklists.some(i => i.is_completed) && selectedChecklistIds.length === 0 && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete all completed items?')) {
                                                    router.delete(`/tasks/${task.id}/checklists/completed`, { preserveScroll: true });
                                                }
                                            }}
                                            className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                        >
                                            <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                            <span>Clear Completed</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={generateAIBreakdown}
                                        disabled={isGeneratingAI}
                                        className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-all hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                                    >
                                        {isGeneratingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                        <span>{isGeneratingAI ? 'Generating...' : 'AI Breakdown'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="mb-6 space-y-2">
                                {task.checklists.length === 0 ? (
                                    <p className="py-2 text-sm text-neutral-400 italic">No sub-tasks yet. Break this task down into smaller steps.</p>
                                ) : (
                                    task.checklists.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleSelection(item.id)}
                                            className={`group flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-2 transition-all ${
                                                selectedChecklistIds.includes(item.id) 
                                                    ? 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10' 
                                                    : 'border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/30'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleChecklistItem(item.id);
                                                    }}
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                                                        item.is_completed 
                                                            ? 'border-indigo-600 bg-indigo-600' 
                                                            : 'border-neutral-300 hover:border-indigo-500 dark:border-neutral-700'
                                                    }`}
                                                >
                                                    {!!item.is_completed && <Check className="h-3 w-3 text-white" />}
                                                </button>
                                                <span
                                                    className={`text-sm select-none ${
                                                        item.is_completed 
                                                            ? 'text-neutral-400 line-through' 
                                                            : 'text-neutral-700 dark:text-neutral-300'
                                                    }`}
                                                >
                                                    {item.content}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteChecklistItem(item.id);
                                                }}
                                                className="p-1 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-red-500"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={addChecklistItem} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Add a sub-task..."
                                    value={checklistForm.data.content}
                                    onChange={(e) => checklistForm.setData('content', e.target.value)}
                                    className="h-11 flex-1 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-500"
                                />
                                <button
                                    type="submit"
                                    disabled={checklistForm.processing}
                                    className="h-11 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-95 disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </form>
                        </div>

                        {/* Attachments Section */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                    <Paperclip className="h-5 w-5 text-neutral-400" />
                                    Attachments
                                </h2>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    {isUploading ? <Clock className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                                    Upload File
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                            </div>

                            {serverErrors.file && (
                                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4" />
                                    {serverErrors.file}
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                {task.attachments?.length === 0 ? (
                                    <div className="col-span-full rounded-xl border-2 border-dashed border-neutral-100 py-4 text-center dark:border-neutral-800">
                                        <p className="text-sm text-neutral-500 italic">No attachments yet.</p>
                                    </div>
                                ) : (
                                    task.attachments?.map((attachment) => (
                                        <a
                                            key={attachment.id}
                                            href={attachment.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 rounded-xl border border-neutral-200 p-3 transition-all hover:border-blue-400 hover:bg-blue-50/30 dark:border-neutral-800 dark:hover:border-blue-500/50 dark:hover:bg-blue-900/10"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                                                    {attachment.file_name}
                                                </p>
                                                <p className="text-xs text-neutral-500">{new Date(attachment.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </a>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                                <MessageSquare className="h-5 w-5 text-neutral-400" />
                                Activity & Comments
                            </h2>

                            <div className="space-y-6">
                                {task.comments?.length === 0 ? (
                                    <p className="text-sm text-neutral-500 italic">No comments yet. Be the first!</p>
                                ) : (
                                    task.comments?.map((comment) => (
                                        <div key={comment.id} className="flex gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                                                {comment.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-neutral-900 dark:text-white">{comment.user.name}</span>
                                                    <span className="text-[10px] text-neutral-400">{new Date(comment.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="rounded-2xl rounded-tl-none bg-neutral-50 p-4 dark:bg-neutral-800/50">
                                                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{comment.comment}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={submitComment} className="mt-8 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                                <div className="flex gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500 dark:bg-neutral-800">
                                        Me
                                    </div>
                                    <div className="relative flex-1">
                                        {showMentions && filteredUsers.length > 0 && (
                                            <div className="absolute bottom-full left-0 mb-2 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                                                <div className="bg-neutral-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800/50">
                                                    Mention Team Member
                                                </div>
                                                <div className="max-h-48 overflow-y-auto p-1">
                                                    {filteredUsers.map((user, idx) => (
                                                        <button
                                                            key={user.id}
                                                            type="button"
                                                            onClick={() => selectMention(user)}
                                                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                                                mentionIndex === idx 
                                                                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                                                                    : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'
                                                            }`}
                                                        >
                                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                            <div className="flex-1 overflow-hidden">
                                                                <p className="truncate font-semibold">{user.name}</p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            id="comment-input"
                                            type="text"
                                            value={data.comment}
                                            onChange={handleCommentChange}
                                            placeholder="Write a comment... (use @ to mention)"
                                            className="h-11 w-full rounded-xl border-neutral-300 bg-neutral-50 px-4 pr-12 text-sm shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                        />
                                        <button
                                            type="submit"
                                            disabled={processing || !data.comment}
                                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Details Sidebar */}
                    <div className="space-y-6 md:col-span-1">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <h3 className="mb-4 text-sm font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">Details</h3>

                            <div className="space-y-4">
                                {/* Status */}
                                <div>
                                    <label className="text-xs font-medium text-neutral-500">Status</label>
                                    <select
                                        value={task.status}
                                        onChange={(e) => updateField('status', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-neutral-300 py-2 pr-10 pl-3 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>

                                {/* Assignees */}
                                <div>
                                    <label className="mb-3 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                                        <UserIcon className="h-3 w-3" /> Assignees
                                    </label>
                                    <UserSelect
                                        users={users}
                                        selectedIds={task.assignees?.map((a) => a.id) || []}
                                        onChange={(ids) => updateField('assignees', ids)}
                                    />
                                </div>

                                {/* Blocked By */}
                      <div>
                           <label className="text-xs font-medium text-neutral-500 flex items-center gap-1.5 mb-1"><AlertCircle className="h-3 w-3"/> Blocked By</label>
                           <select
                               value={task.blocked_by_id || ''}
                               onChange={(e) => updateField('blocked_by_id', e.target.value ? Number(e.target.value) : null)}
                               className="block w-full rounded-lg border-neutral-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                           >
                               <option value="">None</option>
                               {allTasks?.filter(t => t.id !== task.id).map(t => (
                                   <option key={t.id} value={t.id}>{t.title}</option>
                               ))}
                           </select>
                           {task.blockedBy && task.blockedBy.status !== 'done' && (
                               <p className="mt-1 text-[10px] text-red-500 flex items-center gap-1">
                                   <AlertCircle className="h-2.5 w-2.5" /> This task is blocked
                               </p>
                           )}
                       </div>

                      {/* Priority */}
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                                            <Flag className="h-3 w-3" /> Priority
                                        </label>
                                        <span
                                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ring-1 ring-inset ${getPriorityStyles(task.priority)}`}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>
                                    <select
                                        value={task.priority}
                                        onChange={(e) => updateField('priority', e.target.value)}
                                        className="block w-full rounded-lg border-neutral-300 py-2 pr-10 pl-3 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                {/* Due Date */}
                                <div>
                                    <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                                        <Calendar className="h-3 w-3" /> Due Date
                                    </label>
                                    <DatePicker
                                        date={task.due_date ? new Date(task.due_date) : undefined}
                                        onChange={(date) => updateField('due_date', format(date, 'yyyy-MM-dd'))}
                                    />
                                </div>

                                <div className="mt-6 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
                                                router.delete(`/tasks/${task.id}`);
                                            }
                                        }}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Task
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
