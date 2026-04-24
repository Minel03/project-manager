import * as React from "react";
import { Search, Check, X } from "lucide-react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface UserSelectProps {
    users: User[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function UserSelect({ users, selectedIds, onChange, placeholder = "Select assignees...", disabled = false }: UserSelectProps) {
    const [query, setQuery] = React.useState("");
    
    const selectedUsers = users.filter(u => selectedIds.includes(u.id));
    
    const filteredUsers = query === "" 
        ? users 
        : users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()));

    const toggleUser = (id: number) => {
        const newIds = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];
        onChange(newIds);
    };

    return (
        <div className="space-y-2">
            <Popover className="relative w-full">
                <PopoverButton disabled={disabled} className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm transition-all hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                    <div className="flex flex-wrap gap-1.5">
                        {selectedUsers.length > 0 ? (
                            selectedUsers.map(u => (
                                <span key={u.id} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                    {u.name}
                                    <button 
                                        type="button" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleUser(u.id);
                                        }}
                                        className="rounded-full hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))
                        ) : (
                            <span className="text-neutral-500">{placeholder}</span>
                        )}
                    </div>
                    <Search className="h-4 w-4 text-neutral-400" />
                </PopoverButton>

                <Transition
                    as={React.Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                >
                    <PopoverPanel className="absolute z-50 mt-2 w-full max-h-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="border-b border-neutral-100 p-2 dark:border-neutral-800">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <input
                                    className="w-full bg-transparent py-2 pl-9 pr-4 text-sm outline-hidden dark:text-white"
                                    placeholder="Search people..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto p-1 scrollbar-thin">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((u) => {
                                    const isSelected = selectedIds.includes(u.id);
                                    return (
                                        <button
                                            key={u.id}
                                            type="button"
                                            onClick={() => toggleUser(u.id)}
                                            className={cn(
                                                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
                                                isSelected 
                                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" 
                                                    : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-medium">{u.name}</div>
                                                    <div className="text-[10px] text-neutral-500">{u.email}</div>
                                                </div>
                                            </div>
                                            {isSelected && <Check className="h-4 w-4" />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-sm text-neutral-500">No people found.</div>
                            )}
                        </div>
                    </PopoverPanel>
                </Transition>
            </Popover>
        </div>
    );
}
