import * as React from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DatePickerProps {
    date?: Date;
    onChange: (date: Date) => void;
    placeholder?: string;
}

export function DatePicker({ date, onChange, placeholder = "Pick a date" }: DatePickerProps) {
    const [viewDate, setViewDate] = React.useState(date || new Date());

    const days = React.useMemo(() => {
        const start = startOfWeek(startOfMonth(viewDate));
        const end = endOfWeek(endOfMonth(viewDate));
        return eachDayOfInterval({ start, end });
    }, [viewDate]);

    return (
        <Popover className="relative w-full">
            <PopoverButton className="flex w-full items-center justify-between rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-all hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:border-indigo-500">
                <span className={cn("whitespace-nowrap font-medium mr-2", !date && "text-neutral-500")}>
                    {date ? format(date, "yyyy-MM-dd") : placeholder}
                </span>
                <CalendarIcon className="h-4 w-4 shrink-0 text-neutral-400 opacity-50" />
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
                <PopoverPanel className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                    {({ close }) => (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                                    {format(viewDate, "MMMM yyyy")}
                                </h4>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setViewDate(subMonths(viewDate, 1))}
                                        className="rounded-lg p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronLeft className="h-4 w-4 text-neutral-500" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setViewDate(addMonths(viewDate, 1))}
                                        className="rounded-lg p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronRight className="h-4 w-4 text-neutral-500" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                                    <div key={d} className="py-1">{d}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {days.map((day) => {
                                    const isSelected = date && isSameDay(day, date);
                                    const isCurrentMonth = isSameMonth(day, viewDate);
                                    
                                    return (
                                        <button
                                            key={day.toString()}
                                            type="button"
                                            onClick={() => {
                                                onChange(day);
                                                close();
                                            }}
                                            className={cn(
                                                "h-9 w-9 rounded-lg text-sm transition-all flex items-center justify-center",
                                                !isCurrentMonth && "text-neutral-300 dark:text-neutral-700",
                                                isCurrentMonth && !isSelected && "text-neutral-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-neutral-300 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400",
                                                isSelected && "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none",
                                                isToday(day) && !isSelected && "border border-indigo-200 text-indigo-600 dark:border-indigo-900"
                                            )}
                                        >
                                            {format(day, "d")}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    onChange(today);
                                    setViewDate(today);
                                    close();
                                }}
                                className="w-full rounded-xl bg-neutral-50 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                            >
                                Today
                            </button>
                        </div>
                    )}
                </PopoverPanel>
            </Transition>
        </Popover>
    );
}
