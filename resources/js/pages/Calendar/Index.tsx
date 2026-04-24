import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    url: string;
    backgroundColor: string;
    extendedProps: {
        project: string;
        status: string;
    };
}

export default function CalendarPage({ events }: { events: CalendarEvent[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Calendar', href: '/calendar' },
    ];

    const handleEventDrop = (info: { event: { id: string; start: Date } }) => {
        const { id, start } = info.event;
        router.put(`/tasks/${id}`, {
            due_date: start.toISOString().split('T')[0]
        }, {
            preserveScroll: true
        });
    };

    const handleEventClick = (info: { jsEvent: { preventDefault: () => void }; event: { url: string } }) => {
        info.jsEvent.preventDefault();
        router.visit(info.event.url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />
            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                            <CalendarIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Calendar</h1>
                            <p className="text-sm text-neutral-500">Track deadlines and schedule tasks across all projects.</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
                    <style>{`
                        .fc { --fc-border-color: #f0f0f0; --fc-button-bg-color: #6366f1; --fc-button-border-color: #6366f1; --fc-button-hover-bg-color: #4f46e5; --fc-button-active-bg-color: #4338ca; }
                        .dark .fc { --fc-border-color: #262626; --fc-today-bg-color: #171717; }
                        .fc-event { cursor: pointer; border: none !important; padding: 2px 4px; border-radius: 6px !important; font-size: 0.85rem !important; }
                        .fc-header-toolbar { padding: 8px 0; }
                        .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 700 !important; }
                    `}</style>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        events={events}
                        editable={true}
                        droppable={true}
                        eventDrop={handleEventDrop}
                        eventClick={handleEventClick}
                        height="auto"
                        aspectRatio={1.8}
                        eventTimeFormat={{
                            hour: 'numeric',
                            minute: '2-digit',
                            meridiem: 'short'
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
