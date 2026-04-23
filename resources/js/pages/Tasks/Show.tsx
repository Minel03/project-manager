import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { CheckCircle2, Clock, Circle, MessageSquare, Calendar, Flag, User as UserIcon, Send, Paperclip, FileText, X, UploadCloud, AlertCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

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
  project: { id: number, name: string };
  comments: Comment[];
  attachments: Attachment[];
  checklists: ChecklistItem[];
};

export default function ShowTask({ task, users }: { task: Task, users: User[] }) {
  const { props } = usePage();
  const serverErrors = props.errors as any;

  const breadcrumbs: BreadcrumbItem[] = [
      { title: 'Tasks', href: '/tasks' },
      { title: `TASK-${task.id}`, href: `/tasks/${task.id}` },
  ];

  const { data, setData, post, processing, reset } = useForm({
    comment: ''
  });

  const checklistForm = useForm({
    content: ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        onSuccess: () => checklistForm.reset('content')
    });
  };

  const toggleChecklistItem = (id: number) => {
    router.post(`/checklists/${id}/toggle`, {}, { preserveScroll: true });
  };

  const deleteChecklistItem = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
        router.delete(`/checklists/${id}`, { preserveScroll: true });
    }
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/tasks/${task.id}/comments`, {
      preserveScroll: true,
      onSuccess: () => reset('comment')
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
      }
    });
  };

  const updateField = (field: string, value: string | string[]) => {
    router.put(`/tasks/${task.id}`, { [field]: value }, { preserveScroll: true });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={task.title} />
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <div className="flex items-center justify-between gap-8 border-b border-neutral-200 pb-4 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{task.project?.name}</span>
                <span className="text-neutral-300 dark:text-neutral-600">•</span>
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">#TASK-{task.id}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">{task.title}</h1>
          </div>
          <Link href="/tasks" className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700 dark:hover:bg-neutral-700 whitespace-nowrap">
            Back to Board
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Description</h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-300">
                      {task.description ? (
                          <p className="whitespace-pre-wrap leading-relaxed">{task.description}</p>
                      ) : (
                          <p className="italic text-neutral-400">No description provided.</p>
                      )}
                  </div>
              </div>

              {/* Checklist Section */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                          <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                              <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                              Checklist
                          </h2>
                      </div>
                      <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full dark:bg-neutral-800 dark:text-neutral-400">
                          {task.checklists.filter(i => i.is_completed).length}/{task.checklists.length} completed
                      </span>
                  </div>

                  <div className="mb-6 space-y-2">
                      {task.checklists.length === 0 ? (
                          <p className="text-sm text-neutral-400 italic py-2">No sub-tasks yet. Break this task down into smaller steps.</p>
                      ) : (
                          task.checklists.map((item) => (
                              <div key={item.id} className="group flex items-center justify-between gap-3 rounded-xl border border-transparent p-2 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                                  <div className="flex items-center gap-3">
                                      <button 
                                          onClick={() => toggleChecklistItem(item.id)}
                                          className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${item.is_completed ? 'bg-indigo-600 border-indigo-600' : 'border-neutral-300 hover:border-indigo-500 dark:border-neutral-700'}`}
                                      >
                                          {item.is_completed && <X className="h-3 w-3 text-white" />}
                                      </button>
                                      <span className={`text-sm ${item.is_completed ? 'text-neutral-400 line-through' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                          {item.content}
                                      </span>
                                  </div>
                                  <button 
                                      onClick={() => deleteChecklistItem(item.id)}
                                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all p-1"
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
                          onChange={e => checklistForm.setData('content', e.target.value)}
                          className="flex-1 rounded-lg border-neutral-200 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
                      />
                      <button 
                          type="submit" 
                          disabled={checklistForm.processing}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700"
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
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                  </div>

                  {serverErrors.file && (
                    <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        {serverErrors.file}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                      {task.attachments?.length === 0 ? (
                          <div className="col-span-full py-4 text-center border-2 border-dashed border-neutral-100 rounded-xl dark:border-neutral-800">
                              <p className="text-sm text-neutral-500 italic">No attachments yet.</p>
                          </div>
                      ) : (
                          task.attachments?.map(attachment => (
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
                                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{attachment.file_name}</p>
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
                          task.comments?.map(comment => (
                              <div key={comment.id} className="flex gap-4">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                                      {comment.user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 rounded-2xl rounded-tl-none bg-neutral-50 p-4 dark:bg-neutral-800/50">
                                      <div className="mb-1 flex items-center justify-between">
                                          <span className="font-medium text-neutral-900 dark:text-white">{comment.user.name}</span>
                                          <span className="text-xs text-neutral-500">{new Date(comment.created_at).toLocaleString()}</span>
                                      </div>
                                      <p className="text-sm text-neutral-700 dark:text-neutral-300">{comment.comment}</p>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>

                  <form onSubmit={submitComment} className="mt-8 flex gap-3 border-t border-neutral-100 pt-6 dark:border-neutral-800">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-bold text-neutral-500 dark:bg-neutral-800">
                          Me
                      </div>
                      <div className="relative flex-1">
                          <input
                              type="text"
                              value={data.comment}
                              onChange={e => setData('comment', e.target.value)}
                              placeholder="Write a comment..."
                              className="w-full rounded-xl border-neutral-300 bg-neutral-50 pr-12 text-sm shadow-sm transition-colors focus:border-blue-500 focus:bg-white focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                          />
                          <button type="submit" disabled={processing || !data.comment} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-900/30">
                              <Send className="h-4 w-4" />
                          </button>
                      </div>
                  </form>
              </div>
          </div>

          {/* Details Sidebar */}
          <div className="md:col-span-1 space-y-6">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Details</h3>
                  
                  <div className="space-y-4">
                      {/* Status */}
                      <div>
                          <label className="text-xs font-medium text-neutral-500">Status</label>
                          <select
                              value={task.status}
                              onChange={e => updateField('status', e.target.value)}
                              className="mt-1 block w-full rounded-lg border-neutral-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                          >
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                          </select>
                      </div>

                      {/* Assignees */}
                      <div>
                          <label className="text-xs font-medium text-neutral-500 flex items-center gap-1.5 mb-1"><UserIcon className="h-3 w-3"/> Assignees</label>
                          <select
                              multiple
                              value={task.assignees?.map(a => a.id.toString()) || []}
                              onChange={e => updateField('assignees', Array.from(e.target.selectedOptions, option => option.value))}
                              className="block w-full rounded-lg border-neutral-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                          >
                              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </select>
                          <p className="mt-1 text-xs text-neutral-500">Hold Ctrl/Cmd to select multiple</p>
                      </div>

                      {/* Priority */}
                      <div>
                          <label className="text-xs font-medium text-neutral-500 flex items-center gap-1.5 mb-1"><Flag className="h-3 w-3"/> Priority</label>
                          <select
                              value={task.priority}
                              onChange={e => updateField('priority', e.target.value)}
                              className="block w-full rounded-lg border-neutral-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                          >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                          </select>
                      </div>

                      {/* Due Date */}
                      <div>
                          <label className="text-xs font-medium text-neutral-500 flex items-center gap-1.5 mb-1"><Calendar className="h-3 w-3"/> Due Date</label>
                          <input
                              type="date"
                              value={task.due_date ? task.due_date.split('T')[0] : ''}
                              onChange={e => updateField('due_date', e.target.value)}
                              className="block w-full rounded-lg border-neutral-300 py-2 px-3 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                          />
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
