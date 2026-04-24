import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { router } from "@inertiajs/react"
import axios from "axios"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Folder, List, User, Plus, Search, LayoutDashboard } from "lucide-react"

type SearchResult = {
    id: string;
    title: string;
    type: 'Project' | 'Task' | 'User';
    url: string;
};

export function SearchPalette() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    useEffect(() => {
        if (query.length < 1) {
            setResults([])
            return
        }

        const fetchResults = async () => {
            setLoading(true)
            try {
                const response = await axios.get(`/search?q=${query}`)
                setResults(response.data)
            } catch (error) {
                console.error("Search failed", error)
            } finally {
                setLoading(false)
            }
        }

        const timer = setTimeout(fetchResults, 300)
        return () => clearTimeout(timer)
    }, [query])

    const runCommand = useCallback((url: string) => {
        setOpen(false)
        router.visit(url)
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <div className="flex items-center border-b border-neutral-100 dark:border-neutral-800 px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput 
                    placeholder="Search projects, tasks, members..." 
                    value={query}
                    onValueChange={setQuery}
                    className="h-12 w-full bg-transparent outline-none border-none focus:ring-0"
                />
            </div>
            <CommandList className="max-h-[350px] overflow-y-auto overflow-x-hidden">
                <CommandEmpty className="py-6 text-center text-sm">
                    {loading ? "Searching..." : "No results found."}
                </CommandEmpty>
                
                {!query && (
                    <>
                        <CommandGroup heading="Quick Actions">
                            <CommandItem onSelect={() => runCommand("/tasks/create")} className="flex items-center gap-2 px-4 py-3 cursor-pointer">
                                <Plus className="h-4 w-4 text-indigo-500" />
                                <span>Create New Task</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand("/projects/create")} className="flex items-center gap-2 px-4 py-3 cursor-pointer">
                                <Folder className="h-4 w-4 text-emerald-500" />
                                <span>Create New Project</span>
                            </CommandItem>
                        </CommandGroup>
                        <CommandGroup heading="Navigation">
                            <CommandItem onSelect={() => runCommand("/dashboard")} className="flex items-center gap-2 px-4 py-3 cursor-pointer">
                                <LayoutDashboard className="h-4 w-4 text-blue-500" />
                                <span>Go to Dashboard</span>
                            </CommandItem>
                            <CommandItem onSelect={() => runCommand("/tasks")} className="flex items-center gap-2 px-4 py-3 cursor-pointer">
                                <List className="h-4 w-4 text-amber-500" />
                                <span>View Kanban Board</span>
                            </CommandItem>
                        </CommandGroup>
                    </>
                )}

                {results.length > 0 && (
                    <CommandGroup heading="Search Results">
                        {results.map((result) => (
                            <CommandItem
                                key={result.id}
                                value={result.title}
                                onSelect={() => runCommand(result.url)}
                                className="flex items-center gap-2 px-4 py-3 cursor-pointer"
                            >
                                {result.type === 'Project' && <Folder className="h-4 w-4 text-indigo-500" />}
                                {result.type === 'Task' && <List className="h-4 w-4 text-blue-500" />}
                                {result.type === 'User' && <User className="h-4 w-4 text-emerald-500" />}
                                <span className="flex-1">{result.title}</span>
                                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">{result.type}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
            <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 px-4 py-2 bg-neutral-50/50 dark:bg-neutral-900/50">
                <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                    <kbd className="rounded border border-neutral-200 bg-white px-1 dark:border-neutral-700 dark:bg-neutral-800">⌘K</kbd> to open
                </p>
                <div className="flex items-center gap-4 text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1"><kbd className="rounded border border-neutral-200 bg-white px-1 dark:border-neutral-700 dark:bg-neutral-800">↑↓</kbd> Navigate</span>
                    <span className="flex items-center gap-1"><kbd className="rounded border border-neutral-200 bg-white px-1 dark:border-neutral-700 dark:bg-neutral-800">↵</kbd> Select</span>
                </div>
            </div>
        </CommandDialog>
    )
}
