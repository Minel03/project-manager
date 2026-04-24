import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [scrolled, setScrolled] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Head title="Taskly — Smart Project Management">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
                <meta name="description" content="Taskly is a powerful project management platform that helps teams collaborate, track tasks, and deliver projects on time." />
            </Head>

            <style>{`
                * { font-family: 'Inter', sans-serif; }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.3); }
                    50% { box-shadow: 0 0 40px rgba(99,102,241,0.6); }
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
                .animate-fade-up { animation: fade-up 0.8s ease-out forwards; }
                .animate-fade-up-delay-1 { animation: fade-up 0.8s ease-out 0.2s forwards; opacity: 0; }
                .animate-fade-up-delay-2 { animation: fade-up 0.8s ease-out 0.4s forwards; opacity: 0; }
                .animate-fade-up-delay-3 { animation: fade-up 0.8s ease-out 0.6s forwards; opacity: 0; }
                .gradient-text {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
                    background-size: 200% 200%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradient-shift 4s ease infinite;
                }
                .hero-gradient {
                    background: radial-gradient(ellipse at top, rgba(99,102,241,0.15) 0%, transparent 60%),
                                radial-gradient(ellipse at bottom right, rgba(139,92,246,0.1) 0%, transparent 50%),
                                #09090b;
                }
                .card-glass {
                    background: rgba(255,255,255,0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.08);
                }
                .feature-card:hover {
                    transform: translateY(-4px);
                    border-color: rgba(99,102,241,0.4);
                    background: rgba(99,102,241,0.05);
                }
                .feature-card { transition: all 0.3s ease; }
            `}</style>

            <div className="min-h-screen hero-gradient text-white">
                {/* Navbar */}
                <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/10' : ''}`}>
                    <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold tracking-tight">Taskly</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-lg shadow-indigo-500/25"
                                >
                                    Go to Dashboard →
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 shadow-lg shadow-indigo-500/25"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div ref={heroRef} className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
                    {/* Background orbs */}
                    <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
                    <div className="absolute top-40 right-1/4 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

                    <div className="relative mx-auto max-w-4xl">
                        <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300 mb-8">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            Team Project Management, Reimagined
                        </div>

                        <h1 className="animate-fade-up-delay-1 text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6">
                            Ship projects
                            <br />
                            <span className="gradient-text">faster together</span>
                        </h1>

                        <p className="animate-fade-up-delay-2 mx-auto max-w-xl text-lg text-neutral-400 leading-relaxed mb-10">
                            Taskly gives your team a single place to plan, track, and collaborate on projects. From kanban boards to real-time updates — everything you need to stay in sync.
                        </p>

                        <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={route('login')}
                                className="animate-pulse-glow w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-base font-bold text-white transition-all hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-500/30"
                            >
                                Get Started Free →
                            </Link>
                        </div>
                    </div>

                    {/* Floating Dashboard Preview */}
                    <div className="animate-float relative mx-auto mt-20 max-w-4xl rounded-2xl border border-white/10 bg-neutral-900/80 shadow-2xl shadow-black/60 overflow-hidden">
                        <div className="flex items-center gap-2 border-b border-white/10 bg-neutral-800/50 px-4 py-3">
                            <div className="h-3 w-3 rounded-full bg-red-500/70" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                            <div className="h-3 w-3 rounded-full bg-green-500/70" />
                            <div className="ml-4 h-5 w-48 rounded-md bg-neutral-700/50 text-xs text-neutral-500 flex items-center px-2">taskly.app/dashboard</div>
                        </div>
                        <div className="grid grid-cols-3 gap-0">
                            {/* Sidebar */}
                            <div className="col-span-1 border-r border-white/5 bg-neutral-900/50 p-4 hidden sm:block">
                                <div className="mb-6 h-6 w-24 rounded-md bg-indigo-500/20" />
                                {['Dashboard', 'Projects', 'Tasks', 'Calendar', 'Teams'].map((item, i) => (
                                    <div key={item} className={`mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${i === 0 ? 'bg-indigo-600/30 text-indigo-300' : 'text-neutral-500'}`}>
                                        <div className="h-3 w-3 rounded bg-current opacity-50" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                            {/* Main area */}
                            <div className="col-span-2 sm:col-span-2 p-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="h-5 w-32 rounded-md bg-neutral-700/60" />
                                    <div className="h-7 w-20 rounded-lg bg-indigo-600/40" />
                                </div>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {[['Todo', '5', 'text-neutral-400'], ['In Progress', '3', 'text-amber-400'], ['Done', '8', 'text-emerald-400']].map(([label, count, color]) => (
                                        <div key={label} className="rounded-xl border border-white/5 bg-neutral-800/50 p-3">
                                            <div className={`text-xs font-medium ${color} mb-1`}>{label}</div>
                                            <div className="text-lg font-bold text-white">{count}</div>
                                        </div>
                                    ))}
                                </div>
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="mb-2 flex items-center gap-3 rounded-lg border border-white/5 bg-neutral-800/30 p-2.5">
                                        <div className="h-4 w-4 rounded border border-neutral-600" />
                                        <div className="h-3 flex-1 rounded bg-neutral-700/60" />
                                        <div className="h-5 w-12 rounded-full bg-indigo-500/20 text-[9px] text-indigo-400 flex items-center justify-center">HIGH</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="px-6 py-24 mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything your team needs</h2>
                        <p className="text-neutral-400 max-w-lg mx-auto">Powerful tools to organize work, communicate clearly, and stay on top of every deadline.</p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: '🗂️',
                                title: 'Kanban Boards',
                                desc: 'Visualize your workflow with drag-and-drop task boards. Move tasks from Todo to Done in seconds.',
                                color: 'from-indigo-500/20 to-indigo-500/5',
                            },
                            {
                                icon: '📅',
                                title: 'Smart Calendar',
                                desc: 'See all your deadlines in one place. Your calendar auto-syncs with every task assignment.',
                                color: 'from-purple-500/20 to-purple-500/5',
                            },
                            {
                                icon: '⚡',
                                title: 'Real-Time Updates',
                                desc: 'Changes sync instantly across your team. No more stale data or missed notifications.',
                                color: 'from-amber-500/20 to-amber-500/5',
                            },
                            {
                                icon: '🤖',
                                title: 'AI Task Breakdown',
                                desc: 'Let AI break down complex tasks into actionable subtasks automatically using Groq.',
                                color: 'from-emerald-500/20 to-emerald-500/5',
                            },
                            {
                                icon: '🛡️',
                                title: 'Role-Based Access',
                                desc: 'Admins control everything. Members see and work on only what they need. Fully secure.',
                                color: 'from-rose-500/20 to-rose-500/5',
                            },
                            {
                                icon: '📊',
                                title: 'Analytics & Reports',
                                desc: 'Track progress with visual charts. See time logs, completion rates, and team productivity.',
                                color: 'from-sky-500/20 to-sky-500/5',
                            },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className="feature-card card-glass rounded-2xl p-6 cursor-default"
                            >
                                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-2xl`}>
                                    {feature.icon}
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-white">{feature.title}</h3>
                                <p className="text-sm text-neutral-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="px-6 py-24">
                    <div className="mx-auto max-w-2xl text-center rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 p-16">
                        <h2 className="text-4xl font-black mb-4">Ready to take control?</h2>
                        <p className="text-neutral-400 mb-8 text-lg">Sign in and start managing your team's projects today.</p>
                        <Link
                            href={route('login')}
                            className="inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-4 text-base font-bold text-white transition-all hover:from-indigo-500 hover:to-purple-500 shadow-2xl shadow-indigo-500/30"
                        >
                            Sign In to Taskly →
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-white/5 px-6 py-8">
                    <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-white">Taskly</span>
                        </div>
                        <p className="text-xs text-neutral-600">© {new Date().getFullYear()} Taskly. Built for high-performance teams.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
